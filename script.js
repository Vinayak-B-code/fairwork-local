(() => {
"use strict";

/*
  FAIRWORK LOCAL — COMPLETE SCRIPT

  Features:
  - Customer registration and login
  - Worker registration and demo verification
  - Service search and filters
  - English / Marathi language toggle
  - Quote requests and customer quote history
  - Accept, decline, and counteroffer
  - Appointment date and time
  - Booking confirmation and progress tracking
  - Worker dashboard

  IMPORTANT:
  This is a browser-based prototype.
  localStorage is not secure authentication or a shared database.
*/

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_QUOTES = "fairworkQuoteRequests";
const STORAGE_CUSTOMERS = "fairworkCustomers";
const STORAGE_WORKER_PROFILE = "fairworkWorkerProfile";
const SESSION_CUSTOMER = "fairworkCustomerSession";
const SESSION_WORKER = "fairworkWorkerSession";

const services = [
  { name: "Electrician", icon: "⚡", min: 250, max: 1200, tasks: [
    "Minor repair / switch replacement", "Fan or light installation", "Wiring fault diagnosis"
  ]},
  { name: "Plumber", icon: "🔧", min: 250, max: 1500, tasks: [
    "Tap or small leak repair", "Drain blockage / fitting repair", "Fixture installation"
  ]},
  { name: "Cleaner", icon: "🧹", min: 400, max: 1800, tasks: [
    "Single-room / focused cleaning", "Small home cleaning", "Deep cleaning (scope-dependent)"
  ]},
  { name: "Painter", icon: "🎨", min: 800, max: 4500, tasks: [
    "Small patch / touch-up", "Single-room painting labour", "Larger area (materials may be extra)"
  ]},
  { name: "Carpenter", icon: "🪚", min: 300, max: 2500, tasks: [
    "Small adjustment / repair", "Door or furniture repair", "Installation / custom work (scope-dependent)"
  ]}
];

/* Illustrative sample profiles; not verified real workers. */
const workers = [
  { id: "w1", name: "Ravi Kumar", service: "Electrician", icon: "⚡", location: "Kalyan West", price: 550, rating: 4.9, experience: 6, verified: true, jobs: 124, description: "Home electrical repairs and installations." },
  { id: "w2", name: "Imran Shaikh", service: "Plumber", icon: "🔧", location: "Kalyan East", price: 450, rating: 4.8, experience: 8, verified: true, jobs: 98, description: "Leak repairs, fittings, and plumbing maintenance." },
  { id: "w3", name: "Meena Patil", service: "Cleaner", icon: "🧹", location: "Kalyan West", price: 350, rating: 5.0, experience: 4, verified: false, jobs: 67, description: "Home cleaning and tidy-up services." },
  { id: "w4", name: "Suresh Yadav", service: "Painter", icon: "🎨", location: "Dombivli", price: 700, rating: 4.9, experience: 10, verified: true, jobs: 156, description: "Interior painting and wall touch-ups." },
  { id: "w5", name: "Asha More", service: "Carpenter", icon: "🪚", location: "Thane", price: 600, rating: 4.7, experience: 5, verified: false, jobs: 42, description: "Furniture, door, and small carpentry repairs." }
];

const translations = {
  en: {
    navServices:"Services", navWorkers:"Find Professionals", navPrices:"Fair Price Guide", navHow:"How It Works",
    customerLogin:"Customer Login", workerDashboard:"Worker Dashboard",
    eyebrow:"YOUR NEIGHBOURHOOD, YOUR WORKFORCE", heroTitle:'Local skills.<br><span>Fair opportunities.</span>',
    heroText:"Find trusted local service professionals, compare starting prices, and agree on a fair price before the work begins.",
    findProfessional:"Find a Professional →", howItWorks:"How it works", heroPoint1:"✓ Transparent starting prices",
    heroPoint2:"✓ Quote-based bookings", heroPoint3:"✓ Local professionals", localHelp:"LOCAL HELP, MADE SIMPLE",
    closerHelp:"Help is closer than you think.", findNearby:"Find a service professional in your area.",
    agreePrice:"Agree on a price", beforeWork:"Before work begins", needService:"WHAT DO YOU NEED?",
    servicesTitle:"Services for everyday needs", servicesText:"Choose a service to find local professionals who can help.",
    localExperts:"MEET YOUR LOCAL EXPERTS", workersTitle:"Find the right professional",
    workersText:"Compare profiles and request a quote that works for you.", marketplace:"Local service marketplace",
    searchLabel:"Search by name or locality", searchPlaceholder:"e.g. Ravi or Kalyan West", serviceCategory:"Service category",
    allServices:"All services", maxPrice:"Maximum starting price", anyPrice:"Any price", clearFilters:"Clear Filters",
    priceEyebrow:"PLAN WITH CLARITY", priceTitle:"Fair Price Guide",
    priceIntro:"Illustrative price ranges for common jobs around Kalyan–Dombivli.",
    priceDisclaimer:"<strong>Important:</strong> These are illustrative estimates for this prototype, not verified live local rates or guaranteed quotes. Actual costs depend on job size, materials, urgency, travel, and the professional. Agree on the final price before work starts.",
    simpleTransparent:"SIMPLE AND TRANSPARENT", howTitle:"How FairWork Local works",
    howIntro:"A straightforward way for customers and workers to agree on a job.",
    step1Title:"Find a professional", step1Text:"Browse local profiles and compare service categories, areas, and starting prices.",
    step2Title:"Request a quote", step2Text:"Describe the job and suggest an amount. The professional can respond to your request.",
    step3Title:"Agree on the price", step3Text:"Review the quote or counteroffer and confirm the booking when the terms are clear.",
    safetyMatters:"YOUR SAFETY MATTERS", trustTitle:"Trust begins with transparency",
    trustIntro:"Find local service professionals with clear information about their experience, pricing, and profile status.",
    trust1Title:"Understand verification", trust1Text:"A verification badge should reflect checks completed by the platform. Demo badges in this prototype are illustrative and do not confirm real-world identity.",
    trust2Title:"Know the price", trust2Text:"Review the worker's starting price and agree on the final cost before work begins. Ask about any additional charges.",
    trust3Title:"Agree before booking", trust3Text:"Review the quote, job description, and agreed amount. Confirm the booking only when both sides understand the terms.",
    trust4Title:"Check profile details", trust4Text:"Consider the worker's experience, service area, and available references. Demo ratings and job counts are sample data, not verified customer history.",
    important:"Important:", prototypeNotice:"FairWork Local is currently a prototype. Its sample worker profiles, ratings, verification statuses, and job counts have not been independently verified.",
    yourAccount:"YOUR ACCOUNT", yourRequests:"Your quote requests", accountIntro:"Track replies, counteroffers, and confirmed bookings.",
    workerSpace:"WORKER SPACE", dashboardIntro:"Review customer requests and respond to proposed quotes.",
    backCustomer:"← Back to Customer View", quoteRequests:"Your quote requests",
    quoteRequestsIntro:"Accept a request, decline it, or make a counteroffer.",
    letsStart:"LET'S GET STARTED", requestQuote:"Request a quote", quoteIntro:"Share a few details about the work you need done.",
    selectedPro:"Selected professional", yourName:"Your name", namePlaceholder:"Enter your name",
    describeJob:"Describe the job", jobPlaceholder:"Tell the professional what you need help with...",
    proposedAmount:"Your proposed amount (₹)", offerPlaceholder:"Enter your offer",
    priceCanChange:"You can discuss a different price with the professional.", cancel:"Cancel", sendRequest:"Send Quote Request",
    customerSpace:"CUSTOMER SPACE", customerAccount:"Customer account",
    authIntro:"Register or log in to track your quote requests.", register:"Register", login:"Login",
    fullName:"Full name", email:"Email", phone:"Phone number", locality:"Locality", password:"Password (demo only)",
    demoVerification:"Prototype verification: registration is marked demo-verified. No real identity or phone verification is performed.",
    createAccount:"Create Account", workerLogin:"Worker login",
    workerLoginIntro:"Sign in to access the private worker dashboard.", demoCredentials:"Demo credentials:",
    loginToDashboard:"Login to Dashboard", approveDemo:"Approve demo verification", rejectDemo:"Reject demo verification",
    resetDemo:"Reset to pending", workerRegister:"Worker Registration", yearsExperience:"Years of experience",
    startingPrice:"Starting price (₹)", verificationDocument:"Verification document type (demo)",
    documentLast4:"Document reference (last 4 characters only; do not enter full ID)",
    workerVerificationNote:"Demo verification only: submitted details are stored in this browser and are not checked against government records.",
    submitVerification:"Submit registration", workerPending:"Registration received. Demo verification is pending.",
    workerApproved:"Demo verification approved. You may now log in with your registered email and password.",
    quote:"Request a Quote", startingAt:"Starting at", verified:"✓ Demo verified", unverified:"⚠ Not verified",
    years:"years experience", sampleJobs:"sample jobs", trustPassport:"Trust Passport",
    passportText:"Profile status and sample experience details; not independent identity proof.",
    fairDeal:"Fair Deal Summary", fairDealText:"Starting price is an estimate. Agree on scope, materials, travel, and final amount before work.",
    emptyWorkers:"No professionals match these filters. Try changing your search.",
    customerRequired:"Please register and log in before requesting a quote.", loginFirst:"Please log in to your customer account first.",
    quoteSent:"Quote request sent. You can track it in your account.",
    notVerifiedCustomer:"Please log in to continue.", customerCreated:"Account created and demo-verified. You are now logged in.",
    emailExists:"An account with this email already exists.", invalidLogin:"Email or password is incorrect.",
    workerLoginError:"Invalid demo credentials.", workerWelcome:"Demo worker session active. This dashboard is private in this prototype.",
    logout:"Log out", accept:"Accept quote", decline:"Decline", counter:"Make counteroffer",
    acceptCounter:"Accept counteroffer", counterPrompt:"Enter your counteroffer amount in ₹:",
    confirmBooking:"Confirm booking", bookingConfirmed:"Booking confirmed", pending:"Awaiting worker response",
    declined:"Declined", counterPending:"Counteroffer sent", counterAccepted:"Quote accepted",
    customerOffer:"Customer offer", workerOffer:"Worker counteroffer", job:"Job", status:"Status",
    worker:"Professional", customer:"Customer", amount:"Amount", noRequests:"No quote requests yet.",
    onlyDemo:"Demo feature only", customerLogout:"Log out", customerLoggedIn:"Logged in as",
    loginNeededForQuote:"To keep quote history private, please log in before requesting a quote.",
    registeredCustomer:"Signed-in customer", appointmentDate:"Appointment date", appointmentTime:"Appointment time",
    workerOnTheWay:"Worker on the way", workInProgress:"Work in progress", workCompleted:"Work completed",
    updateBookingStatus:"Update booking status", priceTask1:"Minor repair / switch replacement",
    priceTask2:"Fan or light installation", priceTask3:"Wiring fault diagnosis",
    priceTask4:"Tap or small leak repair", priceTask5:"Drain blockage / fitting repair", priceTask6:"Fixture installation",
    priceTask7:"Single-room / focused cleaning", priceTask8:"Small home cleaning",
    priceTask9:"Deep cleaning (scope-dependent)", priceTask10:"Small patch / touch-up",
    priceTask11:"Single-room painting labour", priceTask12:"Larger area (materials may be extra)",
    priceTask13:"Small adjustment / repair", priceTask14:"Door or furniture repair",
    priceTask15:"Installation / custom work (scope-dependent)", rupees:"Indicative range"
  },
  mr: {
    navServices:"सेवा", navWorkers:"व्यावसायिक शोधा", navPrices:"योग्य दर मार्गदर्शक", navHow:"हे कसे कार्य करते",
    customerLogin:"ग्राहक लॉगिन", workerDashboard:"कामगार डॅशबोर्ड",
    eyebrow:"तुमचा परिसर, तुमचे कुशल कामगार", heroTitle:'स्थानिक कौशल्ये.<br><span>सर्वांसाठी योग्य संधी.</span>',
    heroText:"स्थानिक सेवा व्यावसायिक शोधा, सुरुवातीचे दर तुलना करा आणि काम सुरू होण्यापूर्वी योग्य किंमत ठरवा.",
    findProfessional:"व्यावसायिक शोधा →", howItWorks:"हे कसे कार्य करते", heroPoint1:"✓ सुरुवातीचे दर स्पष्ट",
    heroPoint2:"✓ कोटेशनवर आधारित बुकिंग", heroPoint3:"✓ स्थानिक व्यावसायिक",
    localHelp:"स्थानिक मदत, सोप्या पद्धतीने", closerHelp:"मदत तुमच्या जवळच आहे.",
    findNearby:"तुमच्या परिसरातील सेवा व्यावसायिक शोधा.", agreePrice:"किंमत आधी ठरवा",
    beforeWork:"काम सुरू होण्यापूर्वी", needService:"तुम्हाला कोणती सेवा हवी?",
    servicesTitle:"दैनंदिन गरजांसाठी सेवा", servicesText:"मदत मिळवण्यासाठी सेवा निवडा.",
    localExperts:"तुमच्या परिसरातील तज्ज्ञ", workersTitle:"योग्य व्यावसायिक शोधा",
    workersText:"प्रोफाइल तुलना करा आणि योग्य कोटेशन मागवा.", marketplace:"स्थानिक सेवा बाजारपेठ",
    searchLabel:"नाव किंवा परिसराने शोधा", searchPlaceholder:"उदा. रवि किंवा कल्याण पश्चिम",
    serviceCategory:"सेवेचा प्रकार", allServices:"सर्व सेवा", maxPrice:"कमाल सुरुवातीचा दर",
    anyPrice:"कोणताही दर", clearFilters:"फिल्टर काढा", priceEyebrow:"स्पष्ट अंदाजासह नियोजन",
    priceTitle:"योग्य दर मार्गदर्शक", priceIntro:"कल्याण–डोंबिवली परिसरातील सामान्य कामांसाठी उदाहरणार्थ दर.",
    priceDisclaimer:"<strong>महत्त्वाचे:</strong> हे या प्रोटोटाइपसाठी दिलेले अंदाज आहेत. हे प्रत्यक्ष पडताळलेले स्थानिक दर किंवा हमीचे कोटेशन नाहीत. प्रत्यक्ष खर्च कामाचा आकार, साहित्य, तातडी, प्रवास आणि व्यावसायिकानुसार बदलतो. काम सुरू होण्यापूर्वी अंतिम किंमत ठरवा.",
    simpleTransparent:"सोपे आणि पारदर्शक", howTitle:"FairWork Local कसे कार्य करते",
    howIntro:"ग्राहक आणि कामगारांना कामाचे तपशील व किंमत ठरवण्याचा सोपा मार्ग.",
    step1Title:"व्यावसायिक शोधा", step1Text:"स्थानिक प्रोफाइल, सेवा, परिसर आणि सुरुवातीचे दर तुलना करा.",
    step2Title:"कोटेशन मागवा", step2Text:"कामाचे वर्णन करा आणि अंदाजित रक्कम सुचवा. व्यावसायिक उत्तर देऊ शकतो.",
    step3Title:"किंमत ठरवा", step3Text:"कोटेशन किंवा प्रतिकोटेशन तपासा आणि अटी स्पष्ट झाल्यावर बुकिंग निश्चित करा.",
    safetyMatters:"तुमची सुरक्षितता महत्त्वाची", trustTitle:"विश्वासाची सुरुवात पारदर्शकतेतून",
    trustIntro:"अनुभव, दर आणि प्रोफाइल स्थितीची स्पष्ट माहिती असलेले स्थानिक व्यावसायिक शोधा.",
    trust1Title:"पडताळणी समजून घ्या", trust1Text:"पडताळणी चिन्ह प्लॅटफॉर्मने केलेल्या तपासण्यांवर आधारित असावे. या डेमोमधील चिन्हे उदाहरणार्थ आहेत; ती प्रत्यक्ष ओळख सिद्ध करत नाहीत.",
    trust2Title:"किंमत जाणून घ्या", trust2Text:"कामगाराचा सुरुवातीचा दर पाहा आणि कामापूर्वी अंतिम किंमत ठरवा. अतिरिक्त शुल्काबद्दल विचारा.",
    trust3Title:"बुकिंगपूर्वी सहमती", trust3Text:"कोटेशन, कामाचे वर्णन आणि ठरलेली रक्कम तपासा. दोन्ही बाजूंना अटी समजल्यावरच बुकिंग निश्चित करा.",
    trust4Title:"प्रोफाइल तपासा", trust4Text:"अनुभव, सेवा क्षेत्र आणि उपलब्ध संदर्भ विचारात घ्या. डेमो रेटिंग व कामांची संख्या ही नमुना माहिती आहे.",
    important:"महत्त्वाचे:", prototypeNotice:"FairWork Local सध्या प्रोटोटाइप आहे. नमुना प्रोफाइल, रेटिंग, पडताळणी स्थिती आणि कामांची संख्या स्वतंत्रपणे पडताळलेली नाही.",
    yourAccount:"तुमचे खाते", yourRequests:"तुमची कोटेशन विनंती",
    accountIntro:"उत्तरे, प्रतिकोटेशन आणि निश्चित बुकिंगचा मागोवा घ्या.", workerSpace:"कामगार विभाग",
    dashboardIntro:"ग्राहकांच्या विनंत्या पाहा आणि कोटेशनला उत्तर द्या.",
    backCustomer:"← ग्राहक दृश्याकडे परत", quoteRequests:"तुमच्या कोटेशन विनंत्या",
    quoteRequestsIntro:"विनंती स्वीकारा, नाकारा किंवा प्रतिकोटेशन द्या.",
    letsStart:"चला सुरू करूया", requestQuote:"कोटेशन मागवा", quoteIntro:"कामाबद्दल काही तपशील सांगा.",
    selectedPro:"निवडलेला व्यावसायिक", yourName:"तुमचे नाव", namePlaceholder:"तुमचे नाव लिहा",
    describeJob:"कामाचे वर्णन", jobPlaceholder:"तुम्हाला कोणती मदत हवी ते सांगा...",
    proposedAmount:"तुम्ही सुचवलेली रक्कम (₹)", offerPlaceholder:"रक्कम लिहा",
    priceCanChange:"व्यावसायिकाशी वेगळी किंमत ठरवू शकता.", cancel:"रद्द करा", sendRequest:"कोटेशन विनंती पाठवा",
    customerSpace:"ग्राहक विभाग", customerAccount:"ग्राहक खाते",
    authIntro:"कोटेशन विनंत्यांचा मागोवा घेण्यासाठी नोंदणी करा किंवा लॉगिन करा.",
    register:"नोंदणी", login:"लॉगिन", fullName:"पूर्ण नाव", email:"ईमेल", phone:"फोन नंबर",
    locality:"परिसर", password:"पासवर्ड (फक्त डेमो)",
    demoVerification:"प्रोटोटाइप पडताळणी: नोंदणी डेमो-पडताळलेली दाखवली जाते. प्रत्यक्ष ओळख किंवा फोन पडताळणी होत नाही.",
    createAccount:"खाते तयार करा", workerLogin:"कामगार लॉगिन",
    workerLoginIntro:"खासगी कामगार डॅशबोर्ड उघडण्यासाठी लॉगिन करा.",
    demoCredentials:"डेमो लॉगिन तपशील:", loginToDashboard:"डॅशबोर्डमध्ये लॉगिन",
    approveDemo:"डेमो पडताळणी मंजूर", rejectDemo:"डेमो पडताळणी नाका",
    resetDemo:"प्रलंबित स्थितीवर रीसेट", workerRegister:"कामगार नोंदणी",
    yearsExperience:"अनुभवाची वर्षे", startingPrice:"सुरुवातीचा दर (₹)",
    verificationDocument:"पडताळणी दस्तऐवजाचा प्रकार (डेमो)",
    documentLast4:"दस्तऐवज संदर्भ (फक्त शेवटची ४ अक्षरे; पूर्ण ओळख क्रमांक देऊ नका)",
    workerVerificationNote:"फक्त डेमो पडताळणी: माहिती या ब्राउझरमध्ये साठवली जाते; सरकारी नोंदी तपासल्या जात नाहीत.",
    submitVerification:"नोंदणी पाठवा", workerPending:"नोंदणी प्राप्त झाली. डेमो पडताळणी प्रलंबित आहे.",
    workerApproved:"डेमो पडताळणी मंजूर. नोंदणीकृत ईमेल व पासवर्डने लॉगिन करू शकता.",
    quote:"कोटेशन मागवा", startingAt:"सुरुवात", verified:"✓ डेमो पडताळलेले",
    unverified:"⚠ पडताळणी नाही", years:"वर्षांचा अनुभव", sampleJobs:"नमुना कामे",
    trustPassport:"विश्वास पासपोर्ट", passportText:"प्रोफाइल स्थिती व नमुना अनुभव; स्वतंत्र ओळख पुरावा नाही.",
    fairDeal:"योग्य व्यवहार सारांश", fairDealText:"सुरुवातीचा दर अंदाज आहे. काम, साहित्य, प्रवास आणि अंतिम रक्कम आधी ठरवा.",
    emptyWorkers:"या फिल्टरशी जुळणारे व्यावसायिक नाहीत. शोध बदला.",
    customerRequired:"कोटेशन मागवण्यापूर्वी ग्राहक म्हणून नोंदणी व लॉगिन करा.",
    loginFirst:"कृपया आधी ग्राहक खात्यात लॉगिन करा.", quoteSent:"कोटेशन विनंती पाठवली. खात्यात तिचा मागोवा घ्या.",
    notVerifiedCustomer:"पुढे जाण्यासाठी लॉगिन करा.",
        customerCreated:"खाते तयार झाले आणि डेमो-पडताळणी झाली. तुम्ही लॉगिन आहात.",
    emailExists:"या ईमेलचे खाते आधीच आहे.", invalidLogin:"ईमेल किंवा पासवर्ड चुकीचा आहे.",
    workerLoginError:"डेमो लॉगिन तपशील चुकीचे आहेत.",
    workerWelcome:"डेमो कामगार सत्र सुरू आहे. या प्रोटोटाइपमध्ये डॅशबोर्ड खासगी आहे.",
    logout:"लॉगआउट", accept:"कोटेशन स्वीकारा", decline:"नाकारा", counter:"प्रतिकोटेशन द्या",
    acceptCounter:"प्रतिकोटेशन स्वीकारा", counterPrompt:"प्रतिकोटेशनची रक्कम ₹ मध्ये लिहा:",
    confirmBooking:"बुकिंग निश्चित करा", bookingConfirmed:"बुकिंग निश्चित झाले",
    pending:"कामगाराच्या उत्तराची प्रतीक्षा", declined:"नाकारणे", counterPending:"प्रतिकोटेशन पाठवले",
    counterAccepted:"कोटेशन स्वीकारले", customerOffer:"ग्राहकाची रक्कम", workerOffer:"कामगाराचे प्रतिकोटेशन",
    job:"काम", status:"स्थिती", worker:"व्यावसायिक", customer:"ग्राहक", amount:"रक्कम",
    noRequests:"अद्याप कोटेशन विनंत्या नाहीत.", onlyDemo:"फक्त डेमो सुविधा",
    customerLogout:"लॉगआउट", customerLoggedIn:"लॉगिन केलेले",
    loginNeededForQuote:"कोटेशन इतिहास खासगी ठेवण्यासाठी विनंतीपूर्वी लॉगिन करा.",
    registeredCustomer:"लॉगिन केलेला ग्राहक", appointmentDate:"भेटीची तारीख",
    appointmentTime:"भेटीची वेळ", workerOnTheWay:"कामगार येत आहे",
    workInProgress:"काम सुरू आहे", workCompleted:"काम पूर्ण झाले",
    updateBookingStatus:"बुकिंगची स्थिती बदला", priceTask1:"लहान दुरुस्ती / स्विच बदलणे",
    priceTask2:"पंखा किंवा दिवा बसवणे", priceTask3:"वायरिंगमधील दोष शोधणे",
    priceTask4:"नळ किंवा लहान गळती दुरुस्ती", priceTask5:"ड्रेन अडथळा / फिटिंग दुरुस्ती",
    priceTask6:"फिटिंग बसवणे", priceTask7:"एका खोलीची / निवडक स्वच्छता",
    priceTask8:"लहान घराची स्वच्छता", priceTask9:"सखोल स्वच्छता (कामानुसार)",
    priceTask10:"भिंतीचा छोटा भाग / टच-अप", priceTask11:"एका खोलीचे रंगकाम मजुरी",
    priceTask12:"मोठे क्षेत्र (साहित्य वेगळे असू शकते)", priceTask13:"लहान बदल / दुरुस्ती",
    priceTask14:"दरवाजा किंवा फर्निचर दुरुस्ती", priceTask15:"बसवणे / खास काम (कामानुसार)",
    rupees:"अंदाजित दर"
  }
};

let language = localStorage.getItem("fairworkLanguage") || "en";
if (!translations[language]) language = "en";

let currentWorker = null;
let currentCustomer = getSessionCustomer();
let workerLoggedIn = sessionStorage.getItem(SESSION_WORKER) === "true";

function t(key) {
  return (translations[language] && translations[language][key]) ||
    translations.en[key] || key;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function readJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getQuotes() {
  const quotes = readJSON(STORAGE_QUOTES, []);
  return Array.isArray(quotes) ? quotes : [];
}
function saveQuotes(list) { saveJSON(STORAGE_QUOTES, list); }
function getCustomers() {
  const customers = readJSON(STORAGE_CUSTOMERS, []);
  return Array.isArray(customers) ? customers : [];
}

function getSessionCustomer() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_CUSTOMER) || "null");
  } catch {
    return null;
  }
}

function setCustomer(customer) {
  currentCustomer = customer;
  if (customer) {
    sessionStorage.setItem(SESSION_CUSTOMER, JSON.stringify({
      id: customer.id, name: customer.name, email: customer.email, verified: customer.verified
    }));
  } else {
    sessionStorage.removeItem(SESSION_CUSTOMER);
  }
  updateCustomerUI();
}

function updateCustomerUI() {
  const button = $("#customerAuthBtn");
  if (button) {
    button.textContent = currentCustomer
      ? `${t("customerLoggedIn")}: ${currentCustomer.name} · ${t("logout")}`
      : t("customerLogin");
  }
  const section = $("#customerAccountSection");
  if (section) section.hidden = !currentCustomer;
  renderCustomerHistory();
}

function serviceName(name) {
  if (language === "en") return name;
  return ({
    Electrician: "इलेक्ट्रिशियन", Plumber: "प्लंबर", Cleaner: "स्वच्छता सेवा",
    Painter: "रंगारी", Carpenter: "सुतार"
  })[name] || name;
}

function applyTranslations() {
  document.documentElement.lang = language === "mr" ? "mr" : "en";
  $$("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    element.innerHTML = key === "priceDisclaimer"
      ? t("priceDisclaimer")
      : escapeHtml(t(key));
  });
  $$("[data-i18n-html]").forEach(element => {
    const key = element.dataset.i18nHtml;
    element.innerHTML = t(key);
  });
  $$("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  $$("[data-service]").forEach(element => {
    element.textContent = serviceName(element.dataset.service);
  });
  const languageButton = $("#languageToggle");
  if (languageButton) languageButton.textContent = language === "en" ? "मराठी" : "English";
  const workerModeButton = $("#workerModeBtn");
  if (workerModeButton) workerModeButton.textContent = t("workerDashboard");
  const customerAuthButton = $("#customerAuthBtn");
  if (customerAuthButton) {
    customerAuthButton.textContent = currentCustomer
      ? `${t("customerLoggedIn")}: ${currentCustomer.name} · ${t("logout")}`
      : t("customerLogin");
  }
  renderServices();
  renderWorkers();
  renderPriceGuide();
  renderWorkerDashboard();
  renderCustomerHistory();
}

function formatAppointmentDate(date) {
  if (!date) return "—";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return escapeHtml(date);
  return parsed.toLocaleDateString(language === "mr" ? "mr-IN" : "en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function formatAppointmentTime(time) {
  if (!time) return "—";
  const parts = time.split(":").map(Number);
  if (parts.length !== 2 || !Number.isInteger(parts[0]) ||
      !Number.isInteger(parts[1]) || parts[0] < 0 || parts[0] > 23 ||
      parts[1] < 0 || parts[1] > 59) return escapeHtml(time);
  const date = new Date();
  date.setHours(parts[0], parts[1], 0, 0);
  return date.toLocaleTimeString(language === "mr" ? "mr-IN" : "en-IN", {
    hour: "numeric", minute: "2-digit"
  });
}

function isBookingConfirmed(quote) {
  return ["confirmed", "on_the_way", "in_progress", "completed"].includes(quote.status);
}

function renderServices() {
  const box = $("#serviceList");
  if (!box) return;
  box.innerHTML = services.map(service => `
    <button class="service-card" type="button" data-pick-service="${service.name}">
      <span class="service-icon">${service.icon}</span>
      <h3>${serviceName(service.name)}</h3>
      <p>${money(service.min)}–${money(service.max)}</p>
    </button>
  `).join("");
  $$("[data-pick-service]", box).forEach(button => button.addEventListener("click", () => {
    const filter = $("#serviceFilter");
    if (filter) filter.value = button.dataset.pickService;
    renderWorkers();
    $("#workers")?.scrollIntoView({ behavior: "smooth" });
  }));
}

function renderWorkers() {
  const box = $("#workerList");
  if (!box) return;
  const query = ($("#workerSearch")?.value || "").trim().toLowerCase();
  const service = $("#serviceFilter")?.value || "All";
  const maximumPrice = $("#maxPriceFilter")?.value || "all";
  const filtered = workers.filter(worker =>
    (!query || `${worker.name} ${worker.location} ${worker.service}`.toLowerCase().includes(query)) &&
    (service === "All" || worker.service === service) &&
    (maximumPrice === "all" || worker.price <= Number(maximumPrice))
  );
  if (!filtered.length) {
    box.innerHTML = `<div class="no-results">${t("emptyWorkers")}</div>`;
    return;
  }
  box.innerHTML = filtered.map(worker => `
    <article class="worker-card">
      <div class="worker-card-top">
        <div class="worker-icon">${worker.icon}</div>
        <div class="worker-info">
          <h3>${escapeHtml(worker.name)}</h3>
          <p>${serviceName(worker.service)} · ${escapeHtml(worker.location)}</p>
          <div class="worker-rating">★ ${worker.rating.toFixed(1)} · ${worker.experience} ${t("years")}</div>
          <span class="${worker.verified ? "verified-badge" : "unverified-badge"}">
            ${worker.verified ? t("verified") : t("unverified")}
          </span>
        </div>
      </div>
      <p>${escapeHtml(worker.description)}</p>
      <div class="worker-details">
        <span>📍 ${escapeHtml(worker.location)}</span>
        <span>📋 ${worker.jobs} ${t("sampleJobs")}</span>
      </div>
      <div class="trust-passport"><strong>🛡️ ${t("trustPassport")}</strong><br>${t("passportText")}</div>
      <div class="fair-summary"><strong>₹ ${t("fairDeal")}</strong><br>${t("fairDealText")}</div>
      <div class="worker-price">${money(worker.price)} <small>/ ${t("startingAt")}</small></div>
      <button class="quote-button" type="button" data-quote-worker="${worker.id}">${t("quote")}</button>
    </article>
  `).join("");
  $$("[data-quote-worker]", box).forEach(button => button.addEventListener("click", () => openQuote(button.dataset.quoteWorker)));
}

function renderPriceGuide() {
  const box = $("#priceGuideGrid");
  if (!box) return;
  box.innerHTML = services.map((service, index) => `
    <article class="price-card">
      <div class="price-card-head"><div class="price-card-icon">${service.icon}</div><h3>${serviceName(service.name)}</h3></div>
      <div class="price-range">${money(service.min)} – ${money(service.max)}<small>${t("rupees")}</small></div>
      <ul>${service.tasks.map((task, taskIndex) => `<li>${t("priceTask" + (index * 3 + taskIndex + 1))}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function openQuote(workerId) {
  if (!currentCustomer) {
    alert(t("customerRequired"));
    $("#customerAuthDialog")?.showModal();
    return;
  }
  currentWorker = workers.find(worker => worker.id === workerId);
  if (!currentWorker) return;
  if ($("#selectedWorker")) $("#selectedWorker").value = `${currentWorker.name} — ${serviceName(currentWorker.service)}`;
  if ($("#customerName")) $("#customerName").value = currentCustomer.name;
  if ($("#offerAmount")) $("#offerAmount").value = currentWorker.price;
  if ($("#jobDescription")) $("#jobDescription").value = "";
  const date = $("#appointmentDate");
  const time = $("#appointmentTime");
  if (date) {
    date.value = "";
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    date.min = localToday;
  }
  if (time) time.value = "";
  $("#quoteDialog")?.showModal();
}

function closeDialog(selector) {
  const dialog = $(selector);
  if (dialog?.open) dialog.close();
}

function renderBookingProgress(quote) {
  if (!isBookingConfirmed(quote)) return "";
  const steps = [
    { status: "confirmed", label: t("bookingConfirmed"), complete: true },
    { status: "on_the_way", label: t("workerOnTheWay"), complete: ["on_the_way", "in_progress", "completed"].includes(quote.status) },
    { status: "in_progress", label: t("workInProgress"), complete: ["in_progress", "completed"].includes(quote.status) },
    { status: "completed", label: t("workCompleted"), complete: quote.status === "completed" }
  ];
  return `
    <div class="booking-tracking">
      <p><strong>${t("status")}:</strong> <span class="quote-status">${escapeHtml(statusText(quote.status))}</span></p>
      <ol class="booking-progress">
        ${steps.map(step => `<li class="${step.complete ? "is-complete" : ""}">${step.complete ? "✓ " : ""}${step.label}</li>`).join("")}
      </ol>
    </div>
  `;
}

function renderCustomerHistory() {
  const box = $("#customerQuoteHistory");
  if (!box) return;
  if (!currentCustomer) {
    box.innerHTML = "";
    return;
  }
  const quotes = getQuotes().filter(quote => quote.customerId === currentCustomer.id);
  if (!quotes.length) {
    box.innerHTML = `<div class="empty-state">${t("noRequests")}</div>`;
    return;
  }
  box.innerHTML = quotes.slice().reverse().map(quote => `
    <article class="customer-quote-card">
      <h3>${t("worker")}: ${escapeHtml(quote.workerName)}</h3>
      <p><strong>${t("job")}:</strong> ${escapeHtml(quote.jobDescription)}</p>
      <p><strong>${t("appointmentDate")}:</strong> ${formatAppointmentDate(quote.appointmentDate)}</p>
      <p><strong>${t("appointmentTime")}:</strong> ${formatAppointmentTime(quote.appointmentTime)}</p>
      <p><strong>${t("customerOffer")}:</strong> ${money(quote.offerAmount)}</p>
      ${quote.counterOffer ? `<p><strong>${t("workerOffer")}:</strong> ${money(quote.counterOffer)}</p>` : ""}
      ${quote.agreedAmount != null ? `<p><strong>${t("amount")}:</strong> ${money(quote.agreedAmount)}</p>` : ""}
      <p><strong>${t("status")}:</strong> <span class="quote-status">${escapeHtml(statusText(quote.status))}</span></p>
      ${quote.status === "counteroffer" ? `<button type="button" class="primary-button" data-accept-counter="${escapeHtml(quote.id)}">${t("acceptCounter")}</button>` : ""}
      ${quote.status === "accepted" ? `<button type="button" class="primary-button" data-confirm-booking="${escapeHtml(quote.id)}">${t("confirmBooking")}</button>` : ""}
      ${renderBookingProgress(quote)}
    </article>
  `).join("");

  $$("[data-accept-counter]", box).forEach(button => button.addEventListener("click", () => {
    updateQuote(button.dataset.acceptCounter, quote => {
      if (quote.status !== "counteroffer") return;
      quote.status = "accepted";
      quote.agreedAmount = quote.counterOffer;
    });
  }));

  $$("[data-confirm-booking]", box).forEach(button => button.addEventListener("click", () => {
    updateQuote(button.dataset.confirmBooking, quote => {
      if (quote.status !== "accepted") return;
      quote.status = "confirmed";
      quote.agreedAmount = quote.agreedAmount ?? quote.offerAmount;
      quote.confirmedAt = new Date().toISOString();
    });
  }));
}

function statusText(status) {
  const map = {
    pending: "pending", declined: "declined", counteroffer: "counterPending",
    accepted: "counterAccepted", confirmed: "bookingConfirmed",
    on_the_way: "workerOnTheWay", in_progress: "workInProgress", completed: "workCompleted"
  };
  return t(map[status] || "pending");
}

function updateQuote(id, mutate) {
  const list = getQuotes();
  const quote = list.find(item => item.id === id);
  if (!quote) return;
  mutate(quote);
  quote.updatedAt = new Date().toISOString();
  saveQuotes(list);
  renderCustomerHistory();
  renderWorkerDashboard();
}

function updateBookingStatus(id, nextStatus) {
  const allowedTransitions = { confirmed: "on_the_way", on_the_way: "in_progress", in_progress: "completed" };
  const list = getQuotes();
  const quote = list.find(item => item.id === id);
  if (!quote || allowedTransitions[quote.status] !== nextStatus) return;
  quote.status = nextStatus;
  quote.updatedAt = new Date().toISOString();
  if (nextStatus === "completed") quote.completedAt = quote.updatedAt;
  saveQuotes(list);
  renderCustomerHistory();
  renderWorkerDashboard();
}

function renderWorkerDashboard() {
  const box = $("#quoteRequests");
  if (!box) return;
  if (!workerLoggedIn) {
    box.innerHTML = `<div class="empty-state">${t("workerLoginIntro")}</div>`;
    return;
  }

  const profile = readJSON(STORAGE_WORKER_PROFILE, null);
  const profilePanel = $("#workerProfilePanel");
  if (profilePanel) {
    profilePanel.innerHTML = profile ? `
      <div class="dashboard-intro">
        <span class="dashboard-intro-icon">🪪</span>
        <div>
          <h3>${escapeHtml(profile.name)} — ${escapeHtml(profile.verificationStatus)}</h3>
          <p>${escapeHtml(profile.service)} · ${escapeHtml(profile.location)} · ${profile.experience} ${t("years")} · ${money(profile.price)} · ${escapeHtml(profile.documentType)} ••••${escapeHtml(profile.documentLast4)}</p>
          <div class="dashboard-actions">
            <button type="button" id="approveDemoWorker">${t("approveDemo")}</button>
            <button type="button" id="rejectDemoWorker">${t("rejectDemo")}</button>
            <button type="button" id="resetDemoWorker">${t("resetDemo")}</button>
          </div>
        </div>
      </div>` : "";
  }

  if (profilePanel && profile) {
    $("#approveDemoWorker")?.addEventListener("click", () => {
      profile.verificationStatus = "Approved (demo)";
      saveJSON(STORAGE_WORKER_PROFILE, profile);
      renderWorkerDashboard();
    });
    $("#rejectDemoWorker")?.addEventListener("click", () => {
      profile.verificationStatus = "Rejected (demo)";
      saveJSON(STORAGE_WORKER_PROFILE, profile);
      renderWorkerDashboard();
    });
    $("#resetDemoWorker")?.addEventListener("click", () => {
      profile.verificationStatus = "Pending demo review";
      saveJSON(STORAGE_WORKER_PROFILE, profile);
      renderWorkerDashboard();
    });
  }

  const quotes = getQuotes();
  if (!quotes.length) {
    box.innerHTML = `<div class="empty-state">${t("noRequests")}</div>`;
    return;
  }

  box.innerHTML = quotes.slice().reverse().map(quote => `
    <article class="quote-request-card">
      <h3>${t("customer")}: ${escapeHtml(quote.customerName)}</h3>
      <p><strong>${t("worker")}:</strong> ${escapeHtml(quote.workerName)} · ${serviceName(quote.service)}</p>
      <p><strong>${t("job")}:</strong> ${escapeHtml(quote.jobDescription)}</p>
      <p><strong>${t("appointmentDate")}:</strong> ${formatAppointmentDate(quote.appointmentDate)}</p>
      <p><strong>${t("appointmentTime")}:</strong> ${formatAppointmentTime(quote.appointmentTime)}</p>
      <p><strong>${t("customerOffer")}:</strong> ${money(quote.offerAmount)}</p>
      ${quote.counterOffer ? `<p><strong>${t("workerOffer")}:</strong> ${money(quote.counterOffer)}</p>` : ""}
      ${quote.agreedAmount != null ? `<p><strong>${t("amount")}:</strong> ${money(quote.agreedAmount)}</p>` : ""}
      <p><strong>${t("status")}:</strong> <span class="quote-status">${escapeHtml(statusText(quote.status))}</span></p>
      <div class="request-actions">
        ${quote.status === "pending" ? `
          <button type="button" data-accept="${escapeHtml(quote.id)}">${t("accept")}</button>
          <button type="button" data-decline="${escapeHtml(quote.id)}">${t("decline")}</button>
          <button type="button" data-counter="${escapeHtml(quote.id)}">${t("counter")}</button>
        ` : ""}
        ${quote.status === "accepted" ? `<button type="button" data-confirm-worker="${escapeHtml(quote.id)}">${t("confirmBooking")}</button>` : ""}
        ${quote.status === "confirmed" ? `<button type="button" data-booking-status="${escapeHtml(quote.id)}" data-next-status="on_the_way">${t("workerOnTheWay")}</button>` : ""}
        ${quote.status === "on_the_way" ? `<button type="button" data-booking-status="${escapeHtml(quote.id)}" data-next-status="in_progress">${t("workInProgress")}</button>` : ""}
        ${quote.status === "in_progress" ? `<button type="button" data-booking-status="${escapeHtml(quote.id)}" data-next-status="completed">${t("workCompleted")}</button>` : ""}
        ${quote.status === "completed" ? `<p>✅ ${t("workCompleted")}</p>` : ""}
      </div>
      ${renderBookingProgress(quote)}
    </article>
  `).join("");

  $$("[data-accept]", box).forEach(button => button.addEventListener("click", () => {
    updateQuote(button.dataset.accept, quote => {
      if (quote.status !== "pending") return;
      quote.status = "accepted";
      quote.agreedAmount = quote.offerAmount;
    });
  }));
  $$("[data-decline]", box).forEach(button => button.addEventListener("click", () => {
    updateQuote(button.dataset.decline, quote => {
      if (quote.status === "pending") quote.status = "declined";
    });
  }));
  $$("[data-counter]", box).forEach(button => button.addEventListener("click", () => {
    const amount = Number(prompt(t("counterPrompt")));
    if (Number.isFinite(amount) && amount > 0) {
      updateQuote(button.dataset.counter, quote => {
        if (quote.status !== "pending") return;
        quote.status = "counteroffer";
        quote.counterOffer = amount;
      });
    }
  }));
  $$("[data-confirm-worker]", box).forEach(button => button.addEventListener("click", () => {
    updateQuote(button.dataset.confirmWorker, quote => {
      if (quote.status !== "accepted") return;
      quote.status = "confirmed";
      quote.agreedAmount = quote.agreedAmount ?? quote.offerAmount;
      quote.confirmedAt = new Date().toISOString();
    });
  }));
  $$("[data-booking-status]", box).forEach(button => button.addEventListener("click", () => {
    updateBookingStatus(button.dataset.bookingStatus, button.dataset.nextStatus);
  }));
}

function showCustomerView() {
  workerLoggedIn = false;
  sessionStorage.removeItem(SESSION_WORKER);
  const dashboard = $("#workerDashboard");
  const customerView = $("#customerView");
  if (dashboard) dashboard.hidden = true;
  if (customerView) customerView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showWorkerView() {
  if (!workerLoggedIn) {
    $("#workerAuthDialog")?.showModal();
    return;
  }
  const dashboard = $("#workerDashboard");
  const customerView = $("#customerView");
  if (customerView) customerView.hidden = true;
  if (dashboard) dashboard.hidden = false;
  renderWorkerDashboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getSupabaseClient() {
  if (window.supabaseClient && typeof window.supabaseClient.auth?.signUp === "function") {
    return window.supabaseClient;
  }
  if (typeof supabaseClient !== "undefined" && supabaseClient?.auth) return supabaseClient;
  return null;
}

function setCustomerAuthMessage(message, isError = false) {
  const box = $("#customerAuthMessage");
  if (!box) return;
  box.textContent = message;
  box.setAttribute("role", "status");
  box.style.color = isError ? "#b42318" : "";
}

function ensureCustomerOtpForm() {
  const dialog = $("#customerAuthDialog");
  if (!dialog || $("#customerOtpForm")) return;
  const form = document.createElement("form");
  form.id = "customerOtpForm";
  form.hidden = true;
  form.innerHTML = `
    <div class="form-field">
      <label for="customerOtpCode">Email verification code</label>
      <input id="customerOtpCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required placeholder="Enter the code from your email">
      <small>Check your inbox and spam folder for the verification code.</small>
    </div>
    <div class="dialog-actions">
      <button type="button" id="customerOtpBack" class="secondary-button">Back</button>
      <button type="submit" class="primary-button">Verify email</button>
    </div>
    <button type="button" id="resendCustomerOtp" class="text-button">Resend code</button>
  `;
  const message = $("#customerAuthMessage", dialog);
  if (message) dialog.insertBefore(form, message);
  else dialog.appendChild(form);
  form.addEventListener("submit", verifyCustomerEmail);
  $("#customerOtpBack")?.addEventListener("click", () => authTab("register"));
  $("#resendCustomerOtp")?.addEventListener("click", resendCustomerOtp);
}

function authTab(tab) {
  ensureCustomerOtpForm();
  const registerMode = tab === "register";
  const registerForm = $("#customerRegisterForm");
  const loginForm = $("#customerLoginForm");
  const otpForm = $("#customerOtpForm");
  if (registerForm) registerForm.hidden = !registerMode;
  if (loginForm) loginForm.hidden = registerMode || tab === "verify";
  if (otpForm) otpForm.hidden = tab !== "verify";
  $("#showCustomerRegister")?.classList.toggle("active", registerMode);
  $("#showCustomerLogin")?.classList.toggle("active", !registerMode && tab !== "verify");
  setCustomerAuthMessage("");
}

async function registerCustomer(event) {
  event.preventDefault();
  const client = getSupabaseClient();
  if (!client) {
    setCustomerAuthMessage("Supabase is not connected. Check supabase-config.js and script order.", true);
    return;
  }
  const name = $("#registerCustomerName")?.value.trim() || "";
  const email = $("#registerCustomerEmail")?.value.trim().toLowerCase() || "";
  const phone = $("#registerCustomerPhone")?.value.trim() || "";
  const locality = $("#registerCustomerLocality")?.value.trim() || "";
  const password = $("#registerCustomerPassword")?.value || "";
  if (!name || !email || !phone || !locality || password.length < 6) {
    setCustomerAuthMessage("Please complete all fields. Password must be at least 6 characters.", true);
    return;
  }
  const submit = $("#customerRegisterForm button[type='submit']");
  if (submit) submit.disabled = true;
  setCustomerAuthMessage("Sending verification code…");
  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone, locality, account_type: "customer" } }
    });
    if (error) throw error;
    if (data?.session) {
      setCustomerAuthMessage("Account created, but email confirmation is disabled in Supabase. Enable email confirmation to require OTP verification.", true);
      return;
    }
    pendingCustomerEmail = email;
    authTab("verify");
    setCustomerAuthMessage(`A verification code was sent to ${email}. Enter it below.`);
    $("#customerOtpCode")?.focus();
  } catch (error) {
    setCustomerAuthMessage(error.message || "Registration failed. Please try again.", true);
  } finally {
    if (submit) submit.disabled = false;
  }
}

let pendingCustomerEmail = "";

async function verifyCustomerEmail(event) {
  event.preventDefault();
  const client = getSupabaseClient();
  const code = $("#customerOtpCode")?.value.trim() || "";
  if (!client || !pendingCustomerEmail || !code) {
    setCustomerAuthMessage("Enter the code sent to your email.", true);
    return;
  }
  setCustomerAuthMessage("Verifying your email…");
  try {
    const { data, error } = await client.auth.verifyOtp({
      email: pendingCustomerEmail,
      token: code,
      type: "signup"
    });
    if (error) throw error;
    const user = data?.user;
    if (!user) throw new Error("Verification succeeded but no user was returned. Please log in.");
    const metadata = user.user_metadata || {};
    const customer = {
      id: user.id,
      name: metadata.full_name || user.email,
      email: user.email,
      phone: metadata.phone || "",
      locality: metadata.locality || "",
      verified: Boolean(user.email_confirmed_at || user.confirmed_at),
      createdAt: user.created_at
    };
    pendingCustomerEmail = "";
    setCustomer(customer);
    $("#customerRegisterForm")?.reset();
    $("#customerOtpForm")?.reset();
    closeDialog("#customerAuthDialog");
    setCustomerAuthMessage("");
  } catch (error) {
    setCustomerAuthMessage(error.message || "The code is invalid or expired. Request a new code.", true);
  }
}

async function resendCustomerOtp() {
  const client = getSupabaseClient();
  if (!client || !pendingCustomerEmail) {
    setCustomerAuthMessage("Register again to request a verification code.", true);
    return;
  }
  setCustomerAuthMessage("Requesting a new code…");
  try {
    const { error } = await client.auth.resend({ type: "signup", email: pendingCustomerEmail });
    if (error) throw error;
    setCustomerAuthMessage(`A new verification code was sent to ${pendingCustomerEmail}.`);
  } catch (error) {
    setCustomerAuthMessage(error.message || "Could not resend the code.", true);
  }
}

async function loginCustomer(event) {
  event.preventDefault();
  const client = getSupabaseClient();
  if (!client) {
    setCustomerAuthMessage("Supabase is not connected. Check supabase-config.js and script order.", true);
    return;
  }
  const email = $("#loginCustomerEmail")?.value.trim().toLowerCase() || "";
  const password = $("#loginCustomerPassword")?.value || "";
  setCustomerAuthMessage("Signing in…");
  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = data?.user;
    if (!user || !(user.email_confirmed_at || user.confirmed_at)) {
      await client.auth.signOut();
      throw new Error("Please verify your email before logging in.");
    }
    const metadata = user.user_metadata || {};
    setCustomer({
      id: user.id,
      name: metadata.full_name || user.email,
      email: user.email,
      phone: metadata.phone || "",
      locality: metadata.locality || "",
      verified: true,
      createdAt: user.created_at
    });
    $("#customerLoginForm")?.reset();
    closeDialog("#customerAuthDialog");
    setCustomerAuthMessage("");
  } catch (error) {
    setCustomerAuthMessage(error.message || "Login failed. Check your email and password.", true);
  }
}

async function logoutCustomer() {
  const client = getSupabaseClient();
  try {
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    }
    setCustomer(null);
  } catch (error) {
    alert(error.message || "Could not log out. Please try again.");
  }
}

function initEvents() {
  $("#languageToggle")?.addEventListener("click", () => {
    language = language === "en" ? "mr" : "en";
    localStorage.setItem("fairworkLanguage", language);
    applyTranslations();
  });

  $("#workerSearch")?.addEventListener("input", renderWorkers);
  $("#serviceFilter")?.addEventListener("change", renderWorkers);
  $("#maxPriceFilter")?.addEventListener("change", renderWorkers);

  $("#clearFiltersBtn")?.addEventListener("click", () => {
    if ($("#workerSearch")) $("#workerSearch").value = "";
    if ($("#serviceFilter")) $("#serviceFilter").value = "All";
    if ($("#maxPriceFilter")) $("#maxPriceFilter").value = "all";
    renderWorkers();
  });

  $("#workerModeBtn")?.addEventListener("click", showWorkerView);
  $("#customerModeBtn")?.addEventListener("click", showCustomerView);

  ensureCustomerOtpForm();
  $("#customerAuthBtn")?.addEventListener("click", () => {
    if (currentCustomer) {
      if (confirm(t("customerLogout") + "?")) void logoutCustomer();
    } else {
      $("#customerAuthDialog")?.showModal();
      authTab("register");
    }
  });

  $("#closeCustomerAuth")?.addEventListener("click", () => closeDialog("#customerAuthDialog"));
  $("#closeWorkerAuth")?.addEventListener("click", () => closeDialog("#workerAuthDialog"));
  $("#showCustomerRegister")?.addEventListener("click", () => authTab("register"));
  $("#showCustomerLogin")?.addEventListener("click", () => authTab("login"));
  $("#customerRegisterForm")?.addEventListener("submit", registerCustomer);
  $("#customerLoginForm")?.addEventListener("submit", loginCustomer);

  $("#showWorkerLogin")?.addEventListener("click", () => {
    $("#workerLoginForm").hidden = false;
    $("#workerRegisterForm").hidden = true;
    $("#showWorkerLogin").classList.add("active");
    $("#showWorkerRegister").classList.remove("active");
    $("#workerAuthMessage").textContent = "";
  });

  $("#showWorkerRegister")?.addEventListener("click", () => {
    $("#workerLoginForm").hidden = true;
    $("#workerRegisterForm").hidden = false;
    $("#showWorkerRegister").classList.add("active");
    $("#showWorkerLogin").classList.remove("active");
    $("#workerAuthMessage").textContent = "";
  });

  $("#workerRegisterForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const profile = {
      id: "wp_" + Date.now(),
      name: $("#newWorkerName").value.trim(),
      email: $("#newWorkerEmail").value.trim().toLowerCase(),
      phone: $("#newWorkerPhone").value.trim(),
      service: $("#newWorkerService").value,
      location: $("#newWorkerLocality").value.trim(),
      experience: Number($("#newWorkerExperience").value),
      price: Number($("#newWorkerPrice").value),
      documentType: $("#newWorkerIdType").value,
      documentLast4: $("#newWorkerIdLast4").value.trim(),
      password: $("#newWorkerPassword").value,
      verificationStatus: "Pending demo review",
      registeredAt: new Date().toISOString()
    };
    saveJSON(STORAGE_WORKER_PROFILE, profile);
    $("#workerAuthMessage").textContent = t("workerPending");
    $("#workerRegisterForm").reset();
  });

  $("#workerLoginForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const email = $("#workerEmail").value.trim().toLowerCase();
    const password = $("#workerPassword").value;
    const profile = readJSON(STORAGE_WORKER_PROFILE, null);
    const demoLogin = email === "worker@fairwork.local" && password === "FairWorkDemo123!";
    const registeredWorker = profile && profile.email === email &&
      profile.password === password && profile.verificationStatus === "Approved (demo)";

    if (demoLogin || registeredWorker) {
      workerLoggedIn = true;
      sessionStorage.setItem(SESSION_WORKER, "true");
      $("#workerAuthMessage").textContent = t("workerWelcome");
      $("#workerLoginForm").reset();
      setTimeout(() => {
        closeDialog("#workerAuthDialog");
        showWorkerView();
      }, 400);
    } else if (profile && profile.email === email && profile.password === password) {
      $("#workerAuthMessage").textContent = t("workerPending");
    } else {
      $("#workerAuthMessage").textContent = t("workerLoginError");
    }
  });

  $("#quoteForm")?.addEventListener("submit", event => {
    event.preventDefault();
    if (!currentCustomer || !currentWorker) {
      alert(t("customerRequired"));
      closeDialog("#quoteDialog");
      return;
    }

    const jobDescription = $("#jobDescription").value.trim();
    const offerAmount = Number($("#offerAmount").value);
    const appointmentDate = $("#appointmentDate")?.value || "";
    const appointmentTime = $("#appointmentTime")?.value || "";

    if (!jobDescription || !Number.isFinite(offerAmount) || offerAmount <= 0 ||
        !appointmentDate || !appointmentTime) {
      alert("Please complete the job details, amount, appointment date and time.");
      return;
    }

    const selectedAppointment = new Date(`${appointmentDate}T${appointmentTime}`);
    if (Number.isNaN(selectedAppointment.getTime()) || selectedAppointment.getTime() <= Date.now()) {
      alert("Please select a future appointment date and time.");
      return;
    }

    const now = new Date().toISOString();
    const quote = {
      id: "q_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      workerId: currentWorker.id,
      workerName: currentWorker.name,
      service: currentWorker.service,
      jobDescription,
      offerAmount,
      appointmentDate,
      appointmentTime,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      counterOffer: null,
      agreedAmount: null
    };

    const quotes = getQuotes();
    quotes.push(quote);
    saveQuotes(quotes);
    closeDialog("#quoteDialog");
    $("#quoteForm").reset();
    currentWorker = null;
    renderCustomerHistory();
    renderWorkerDashboard();
    alert(t("quoteSent"));
  });

  $("#cancelQuote")?.addEventListener("click", () => {
    closeDialog("#quoteDialog");
    currentWorker = null;
  });
  $("#cancelQuoteSecondary")?.addEventListener("click", () => {
    closeDialog("#quoteDialog");
    currentWorker = null;
  });

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_QUOTES) {
      renderCustomerHistory();
      renderWorkerDashboard();
    }
  });
}

function init() {
  initEvents();
  const client = getSupabaseClient();
  if (client) {
    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Could not restore Supabase session:", error.message);
        return;
      }
      const user = data?.session?.user;
      if (!user) {
        currentCustomer = null;
        sessionStorage.removeItem(SESSION_CUSTOMER);
        updateCustomerUI();
        return;
      }
      const metadata = user.user_metadata || {};
      setCustomer({
        id: user.id,
        name: metadata.full_name || user.email,
        email: user.email,
        phone: metadata.phone || "",
        locality: metadata.locality || "",
        verified: Boolean(user.email_confirmed_at || user.confirmed_at),
        createdAt: user.created_at
      });
    });
    client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        currentCustomer = null;
        sessionStorage.removeItem(SESSION_CUSTOMER);
        updateCustomerUI();
      }
    });
  }
  if (!sessionStorage.getItem(SESSION_CUSTOMER)) currentCustomer = null;
  if ($("#workerDashboard")) $("#workerDashboard").hidden = true;
  renderServices();
  renderWorkers();
  renderPriceGuide();
  updateCustomerUI();
  applyTranslations();
}

document.addEventListener("DOMContentLoaded", init);
})();