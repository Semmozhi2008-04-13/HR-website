from weasyprint import HTML


def create_pdf(html):

    file="offers/offer_letter.pdf"

    HTML(
      string=html
    ).write_pdf(file)

    return file