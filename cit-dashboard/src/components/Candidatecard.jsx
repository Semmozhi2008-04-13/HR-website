import axios from "axios";


function CandidateCard({candidate}){


const sendOffer = async()=>{

  await axios.post(
    "http://localhost:8000/send-offer",
    {
      candidate_id:candidate.id
    }
  );

  alert("Offer Sent Successfully");

};


return (

<div>

<h3>{candidate.name}</h3>

<p>{candidate.role}</p>


<button onClick={sendOffer}>
 ✉ Offer
</button>


</div>

)

}


export default CandidateCard;