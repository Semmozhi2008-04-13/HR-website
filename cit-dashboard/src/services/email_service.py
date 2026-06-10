import smtplib
from email.message import EmailMessage


def send_offer(email,pdf):


    msg=EmailMessage()

    msg["Subject"]="Offer Letter"
    msg["From"]="hr@gmail.com"
    msg["To"]=email


    msg.set_content(
    "Please find your offer letter attached"
    )


    with open(pdf,"rb") as f:

        msg.add_attachment(
        f.read(),
        maintype="application",
        subtype="pdf",
        filename="Offer_Letter.pdf"
        )


    server=smtplib.SMTP_SSL(
        "smtp.gmail.com",
        465
    )

    server.login(
       "hr@gmail.com",
       "app_password"
    )

    server.send_message(msg)
