const emiForm = document.getElementById("emiForm");
const emiResult = document.getElementById("emiResult");
const loanForm = document.getElementById("loanForm");
const formMessage = document.getElementById("formMessage");
const FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/mraghavendra.2005@gmail.com";
const testimonialsTrack = document.getElementById("testimonialsTrack");
const testimonialNext = document.getElementById("testimonialNext");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function calculateEmi(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

emiForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = Number(document.getElementById("loanAmount").value);
  const rate = Number(document.getElementById("interestRate").value);
  const tenure = Number(document.getElementById("loanTenure").value);

  if (amount <= 0 || rate < 0 || tenure <= 0) {
    emiResult.textContent = "Please enter valid loan values.";
    return;
  }

  const emi = calculateEmi(amount, rate, tenure);
  const totalPayable = emi * tenure;
  const interestPayable = totalPayable - amount;

  emiResult.innerHTML = `
    <strong>Estimated EMI:</strong> ${formatCurrency(emi)} per month<br>
    <strong>Total Interest:</strong> ${formatCurrency(interestPayable)}<br>
    <strong>Total Amount Payable:</strong> ${formatCurrency(totalPayable)}
  `;
});

loanForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const data = new FormData(loanForm);
  const name = data.get("name");
  const amount = Number(data.get("desiredAmount"));
  const submitButton = loanForm.querySelector('button[type="submit"]');

  if (!name || !amount || amount <= 0) {
    formMessage.textContent = "Please enter valid request details.";
    return;
  }

  data.append("submittedAt", new Date().toLocaleString("en-IN"));

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  formMessage.textContent = "Sending your request...";

  try {
    const response = await fetch(FORM_SUBMIT_ENDPOINT, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    formMessage.textContent = `Thank you, ${name}. Your request for ${formatCurrency(
      amount
    )} has been submitted successfully. We will contact you shortly.`;
    loanForm.reset();
  } catch (error) {
    formMessage.textContent =
      "We could not submit your request right now. Please try again in a moment.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Request";
  }
});

if (testimonialsTrack && testimonialNext) {
  const testimonialCards = Array.from(
    testimonialsTrack.querySelectorAll(".testimonial-card")
  );
  let currentPage = 0;
  let cardsPerPage = 3;
  let totalPages = 1;

  function computeCardsPerPage() {
    if (window.innerWidth < 680) {
      return 1;
    }
    if (window.innerWidth < 1100) {
      return 2;
    }
    return 3;
  }

  function updateTestimonials(resetPage) {
    cardsPerPage = computeCardsPerPage();
    totalPages = Math.max(1, Math.ceil(testimonialCards.length / cardsPerPage));

    if (resetPage) {
      currentPage = 0;
    } else if (currentPage > totalPages - 1) {
      currentPage = totalPages - 1;
    }

    const widthPercent = 100 / cardsPerPage;
    testimonialCards.forEach(function (card) {
      card.style.flex = `0 0 ${widthPercent}%`;
      card.style.maxWidth = `${widthPercent}%`;
    });

    testimonialsTrack.style.transform = `translateX(-${currentPage * 100}%)`;
    testimonialNext.disabled = totalPages <= 1;
  }

  testimonialNext.addEventListener("click", function () {
    currentPage = (currentPage + 1) % totalPages;
    updateTestimonials(false);
  });

  window.addEventListener("resize", function () {
    updateTestimonials(false);
  });

  updateTestimonials(true);
}
