from fastapi import APIRouter

from services.pdf_generator import create_pdf
from services.email_service import send_offer


router = APIRouter()


@router.post("/send-offer")
def send_candidate_offer(data: dict):

    candidate_id = data["candidate_id"]


    # get candidate from PostgreSQL
    candidate = get_candidate(candidate_id)


    # load offer template
    with open(
        "templates/offer.html",
        "r"
    ) as file:

        html = file.read()


    # replace dynamic values

    html = html.replace(
        "{{name}}",
        candidate.name
    )

    html = html.replace(
        "{{role}}",
        candidate.role
    )

    html = html.replace(
        "{{department}}",
        candidate.department
    )


    # create PDF

    pdf_file = create_pdf(html)


    # send mail

    send_offer(
        candidate.email,
        pdf_file
    )


    # update PostgreSQL

    candidate.status = "Offer Sent"

    db.commit()


    return {
        "message":"Offer sent successfully"
    }