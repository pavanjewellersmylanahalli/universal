import io
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFEngine:
    @staticmethod
    def generate_pledge_receipt(
        org_name: str,
        org_address: str,
        org_phone: str,
        receipt_number: str,
        customer_name: str,
        customer_mobile: str,
        pledge_number: str,
        loan_amount: Decimal,
        monthly_rate: Decimal,
        pledge_date: str,
        items: list
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor("#1e293b"),
            alignment=1, # Center
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#64748b"),
            alignment=1,
            spaceAfter=12
        )

        elements.append(Paragraph(org_name, title_style))
        if org_address or org_phone:
            elements.append(Paragraph(f"{org_address or ''} | Phone: {org_phone or ''}", subtitle_style))
        elements.append(Spacer(1, 10))

        # Receipt Details Table
        details_data = [
            [f"<b>Receipt No:</b> {receipt_number}", f"<b>Date:</b> {pledge_date}"],
            [f"<b>Pledge No:</b> {pledge_number}", f"<b>Customer:</b> {customer_name} ({customer_mobile})"],
            [f"<b>Loan Amount:</b> ₹{loan_amount:,.2f}", f"<b>Interest Rate:</b> {monthly_rate}% / month"]
        ]
        t_details = Table(details_data, colWidths=[270, 270])
        t_details.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ]))
        elements.append(t_details)
        elements.append(Spacer(1, 15))

        # Pledged Ornaments Table
        items_data = [["Ornament", "Qty", "Gross Wt (g)", "Net Wt (g)", "Purity", "Est Value"]]
        for item in items:
            items_data.append([
                item.get("ornament_category", ""),
                str(item.get("quantity", 1)),
                f"{float(item.get('gross_weight', 0)):.3f}",
                f"{float(item.get('net_weight', 0)):.3f}",
                item.get("purity", "22K"),
                f"₹{float(item.get('estimated_market_value', 0)):,.2f}"
            ])

        t_items = Table(items_data, colWidths=[140, 40, 80, 80, 70, 130])
        t_items.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        elements.append(t_items)
        elements.append(Spacer(1, 20))

        # Signatures
        sig_data = [["Customer Signature", "Authorized Signatory"]]
        t_sig = Table(sig_data, colWidths=[270, 270])
        t_sig.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,0), (-1,-1), 40),
        ]))
        elements.append(t_sig)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
