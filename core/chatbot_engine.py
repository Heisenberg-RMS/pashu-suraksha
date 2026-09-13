"""
Pashu Suraksha - Intelligent Veterinary Chatbot Engine ("Pashu AI Sahayak")
Conversational AI advisor for livestock keepers, field veterinarians, and para-vets.
Handles clinical symptoms, emergency first-aid, vaccination timelines, withdrawal periods,
and biosecurity in English, Hindi (हिन्दी), Marathi (मराठी), and Telugu (తెలుగు).
"""

from typing import Dict, Any, List
import re

CHATBOT_KNOWLEDGE = [
    {
        "keywords": [
            "fmd", "muh", "khur", "chhale", "blister", "drooling", "saliva", "mouth", "hoof", "feet", "foot",
            "खुरपका", "मुंहपका", "मुंह", "खुर", "छाले", "लार", "पैर",
            "लाळ्या", "खुरकूत", "लाळ", "फोड", "जखम",
            "గాలికుంటు", "లాలాజలం", "నోరు", "గిట్టలు", "బొబ్బలు", "పుండ్లు"
        ],
        "intent": "FMD_TREATMENT",
        "title": "Foot-and-Mouth Disease (खुरपका-मुंहपका / लाळ्या खुरकूत / గాలికుంటు)",
        "is_emergency": True,
        "reply_en": (
            "Foot-and-Mouth Disease (FMD) is a highly contagious viral infection. "
            "**Immediate First Aid Steps:**\n"
            "1. **Isolate Animal:** Segregate infected cattle immediately; halt shared grazing.\n"
            "2. **Oral Care:** Wash mouth ulcers twice daily with mild potassium permanganate solution (1:1000 ratio in water) or 2% baking soda.\n"
            "3. **Hoof Care:** Wash feet with 2% copper sulphate (नीला थोथा) solution. Apply zinc oxide or turmeric-mustard oil paste to prevent maggots.\n"
            "4. **Soft Feed:** Provide cooked rice gruel, boiled crushed wheat, or soft green grass with jaggery.\n"
            "5. **Vaccination:** Healthy animals must receive Raksha-Ovac FMD vaccine bi-annually (before monsoon & winter)."
        ),
        "reply_hi": (
            "खुरपका-मुंहपका (FMD) एक अति संक्रामक विषाणु जनित रोग है।\n"
            "**प्राथमिक उपचार एवं देखभाल:**\n"
            "1. **पशु को अलग रखें:** बीमार पशु को स्वस्थ पशुओं से तुरंत अलग बांधें।\n"
            "2. **मुंह के छालों की सफाई:** 1:1000 लाल दवा (पोटैशियम परमैंगनेट) या 2% मीठा सोडा के हल्के घोल से दिन में दो बार मुंह धोएं।\n"
            "3. **खुरों की देखभाल:** खुरों को 2% नीला थोथा के पानी से धोएं तथा तारपीन तेल व नीम का लेप लगाएं ताकि कीड़े न पड़ें।\n"
            "4. **सुपाच्य आहार:** पशु को दलिया, पका हुआ चावल, व गुड़ का पानी पिलाएं।\n"
            "5. **टीकाकरण:** स्वस्थ पशुओं को वर्ष में दो बार (मई और अक्टूबर) FMD का टीका अवश्य लगवाएं।"
        ),
        "reply_mr": (
            "लाळ्या खुरकूत (FMD) हा अत्यंत संसर्गजन्य विषाणूजन्य आजार आहे.\n"
            "**प्राथमिक उपचार व काळजी:**\n"
            "१. **जनावरास विलग करा:** आजारी जनावराला इतर जनावरांपासून ताबडतोब वेगळे बांधा आणि चरण्यास नेऊ नका.\n"
            "२. **तोंडातील फोडांची स्वच्छता:** १:१००० लाल औषध (पोटॅशियम परमँगनेट) किंवा २% खायच्या सोड्याच्या पाण्याने दिवसातून दोनदा तोंड धुवा.\n"
            "३. **खुरांची निगा:** खुरांच्या जखमा २% मोरचूद (कॉपर सल्फेट) पाण्याने धुऊन हळद व खोबरेल तेल लावा जेणेकरून अळ्या होणार नाहीत.\n"
            "४. **मऊ आहार:** जनावराला शिजवलेली पेज, मऊ भात किंवा गुळाचे पाणी प्यायला द्या.\n"
            "५. **लसीकरण:** निरोगी जनावरांना वर्षातून दोनदा लाळ्या खुरकूत प्रतिबंधक लस नक्की टोचा."
        ),
        "reply_te": (
            "గాలికుంటు వ్యాధి (FMD) అత్యంత తీవ్రంగా వ్యాపించే వైరస్ వ్యాధి.\n"
            "**వెంటనే చేయవలసిన ప్రాథమిక చికిత్స:**\n"
            "1. **పశువును వేరు చేయండి:** వ్యాధి సోకిన పశువును ఆరోగ్యకరమైన పశువుల నుండి వెంటనే వేరు చేయండి.\n"
            "2. **నోటి సంరక్షణ:** నోటి పుండ్లను 1:1000 పొటాషియం పర్మాంగనేట్ (ఎర్రమందు) లేదా 2% వంటసోడా ద్రావణంతో రోజుకు రెండుసార్లు కడగండి.\n"
            "3. **గిట్టల సంరక్షణ:** గిట్టల మధ్య పుండ్లను 2% మైలుతుత్తం ద్రావణంతో కడిగి వేపనూనె లేదా పసుపు పూత పూయండి.\n"
            "4. **మెత్తటి ఆహారం:** పశువుకు రాగి జావ, మెత్తటి గంజి లేదా బెల్లం ద్రావణం తాగించండి.\n"
            "5. **టీకాలు:** ఆరోగ్యకరమైన పశువులకు సంవత్సరానికి రెండుసార్లు తప్పనిసరిగా గాలికుంటు టీకాలు వేయించండి."
        ),
        "suggested_questions": [
            "FMD में दूध पीना सुरक्षित है क्या?",
            "पशु के खुर में कीड़े पड़ गए हैं तो क्या करें?",
            "लाळ्या खुरकूतची लस कधी टोचावी?",
            "గాలికుంటు వ్యాధి సోకిన ఆవు పాలు తాగవచ్చా?"
        ]
    },
    {
        "keywords": [
            "lsd", "lumpy", "nodule", "gath", "skin", "gaanth", "लम्पी", "गांठ", "त्वचा", "फफोले", "दाना", "दाने",
            "गाठी", "कातडी", "कडक", "లంపీ", "కణుతులు", "గడ్డలు", "చర్మం"
        ],
        "intent": "LSD_CARE",
        "title": "Lumpy Skin Disease (गांठदार त्वचा रोग / लम्पी / లంపీ స్కిన్)",
        "is_emergency": False,
        "reply_en": (
            "Lumpy Skin Disease (LSD) is transmitted primarily by biting flies, mosquitoes, and ticks.\n"
            "**Control & Management:**\n"
            "1. **Vector Control:** Spray neem seed kernel extract or fly repellents (camphor in coconut oil) on animals and in the cattle shed.\n"
            "2. **Wound Dressing:** For ruptured nodules, apply povidone-iodine spray or turmeric-mustard oil paste to prevent secondary bacterial infection.\n"
            "3. **Immunity Booster:** Give a herbal mixture of betel leaves, black pepper, garlic, and jaggery twice daily for 5 days.\n"
            "4. **Vaccination:** In unaffected herds, administer Goat Pox vaccine (3ml SC) to provide cross-protection."
        ),
        "reply_hi": (
            "लम्पी स्किन डिजीज (गांठदार त्वचा रोग) मक्खी, मच्छर और किलनी के काटने से फैलता है।\n"
            "**रोकथाम व देशी उपचार:**\n"
            "1. **मक्खी-मच्छर नियंत्रण:** गौशाला में शाम को नीम की सूखी पत्तियों का धुआं करें। पशु के शरीर पर नीम का तेल या कपूर का लेप लगाएं।\n"
            "2. **घाव का उपचार:** फटी हुई गांठों पर बीटाडीन या हल्दी-सरसों के तेल का लेप लगाएं।\n"
            "3. **रोग प्रतिरोधक काढ़ा:** पान का पत्ता, 10 काली मिर्च, लहसुन की 2 कलियां और गुड़ पीसकर दिन में दो बार 5 दिन तक खिलाएं।\n"
            "4. **टीकाकरण:** नजदीकी पशु अस्पताल से स्वस्थ पशुओं को गोट पॉक्स वैक्सीन (Goat Pox) लगवाएं।"
        ),
        "reply_mr": (
            "लम्पी त्वचा रोग (Lumpy Skin Disease) हा डास, माश्या आणि गोचीड चावल्यामुळे पसरतो.\n"
            "**नियंत्रण व घरगुती उपाय:**\n"
            "१. **माशी-डास नियंत्रण:** गोठ्यात कडुनिंबाच्या सुक्या पानांचा धूर करा. जनावरांच्या अंगावर कापूर-खोबरेल तेल लावा.\n"
            "२. **जखमांची काळजी:** फुटलेल्या गाठींवर हळद-गोडेतेल किंवा बीटाडीन लावा जेणेकरून किडे पडणार नाहीत.\n"
            "३. **रोगप्रतिकारक काढा:** विड्याची पाने, १० काळीमिरी, लसणाच्या २ पाकळ्या आणि गूळ एकत्र वाटून दिवसातून २ वेळा ५ दिवस द्या.\n"
            "४. **लसीकरण:** निरोगी जनावरांना गोट पॉक्स (Goat Pox) लस टोचून घ्या."
        ),
        "reply_te": (
            "లంపీ స్కిన్ వ్యాధి ప్రధానంగా దోమలు, ఈగలు మరియు గోమార్ల కాటు వల్ల వ్యాపిస్తుంది.\n"
            "**నివారణ మరియు చికిత్స:**\n"
            "1. **కీటకాల నివారణ:** కొట్టంలో వేపాకు పొగ వేయండి. వేపనూనె లేదా కర్పూరం-కొబ్బరినూనె మిశ్రమాన్ని ఒంటికి పూయండి.\n"
            "2. **పుండ్ల చికిత్స:** పగిలిన గడ్డలపై పోవిడోన్ అయోడిన్ లేదా పసుపు-నూనె పూత వేయండి.\n"
            "3. **దేశవాళీ కషాయం:** తమలపాకులు, 10 మిరియాలు, 2 వెల్లుల్లి రెబ్బలు మరియు బెల్లం కలిపి రోజుకు రెండుసార్లు 5 రోజులు తినిపించండి.\n"
            "4. **టీకాలు:** సమీప పశువైద్యశాలలో ఆరోగ్యకరమైన పశువులకు గోట్ పాక్స్ టీకా వేయించండి."
        ),
        "suggested_questions": [
            "लम्पी रोग का देशी काढ़ा कैसे बनाएं?",
            "लम्पी पीड़ित गाय का दूध उबालकर पी सकते हैं?",
            "गोट पॉक्स का टीका कब लगवाना चाहिए?",
            "లంపీ వ్యాధి నివారణకు దేశవాళీ చిట్కాలు ఏమిటి?"
        ]
    },
    {
        "keywords": [
            "bloat", "pet", "phoolna", "afra", "gas", "tympany", "अफारा", "पेट फूलना",
            "पोट फुगणे", "पोटात गॅस", "కడుపుబ్బరం", "గ్యాస్", "కడుపు ఉబ్బడం"
        ],
        "intent": "BLOAT_EMERGENCY",
        "title": "Acute Rumen Bloat / Tympany (अफारा / पोट फुगणे / కడుపుబ్బరం)",
        "is_emergency": True,
        "reply_en": (
            "🚨 **URGENT EMERGENCY: Acute Bloat in Ruminants**\n"
            "Excessive gas in the rumen can compress the lungs and cause suffocation within hours.\n"
            "**Immediate Action:**\n"
            "1. Keep animal's head elevated. Keep animal standing and walking slowly.\n"
            "2. Fast Relief Drench: Administer 200ml sweet mustard oil mixed with 20g hing (asafoetida) and 25ml turpentine oil.\n"
            "3. Place a wooden bit or thick rope horizontally across the mouth behind teeth to induce continuous salivation and eructation (belching).\n"
            "4. Severe Emergency: If animal collapses and gasps for breath, emergency trocar and cannula puncture into left paralumbar fossa is required by a veterinarian."
        ),
        "reply_hi": (
            "🚨 **आपातकालीन स्थिति: पशु का पेट फूलना (अफारा)**\n"
            "पेट में अधिक गैस बनने से फेफड़ों पर दबाव पड़ता है और सांस रुकने का खतरा होता है।\n"
            "**तत्काल राहत के उपाय:**\n"
            "1. पशु को बैठने न दें, उसे धीरे-धीरे टहलाते रहें तथा सिर को ऊपर की ओर रखें।\n"
            "2. **देशी दवा:** 200 मिली मीठा सरसों का तेल, 20 ग्राम हींग और 50 ग्राम सोंठ का घोल बनाकर तुरंत पिलाएं।\n"
            "3. मुंह में आड़ी लकड़ी या रस्सी बांधें ताकि पशु मुंह चलाए और डकार के जरिए गैस बाहर निकले।\n"
            "4. यदि पशु तड़प रहा हो तो तुरंत नजदीकी पशु चिकित्सक को बुलाएं।"
        ),
        "reply_mr": (
            "🚨 **तातडीची आणीबाणी: जनावरांचे पोट फुगणे (अफारा / गॅस)**\n"
            "पोटात जास्त गॅस झाल्याने फुप्फुसावर दाब येऊन श्वास रोखला जाण्याचा मोठा धोका असतो.\n"
            "**त्वरित करावयाचे उपाय:**\n"
            "१. जनावराला बसू देऊ नका, हळूहळू चालवत ठेवा आणि तोंड उंचावर ठेवा.\n"
            "२. **घरगुती औषध:** २०० मिली गोडेतेल, २० ग्रॅम हिंग व ५० ग्रॅम सुंठ पावडर एकत्र करून त्वरित पाजा.\n"
            "३. तोंडात आडवी लाकडी काठी किंवा दोरी बांधा जेणेकरून जनावर जीभ हलवून ढेकर देईल व गॅस बाहेर पडेल.\n"
            "४. त्रास जास्त असल्यास ताबडतोब पशुवैद्यकीय अधिकाऱ्यांना पाचारण करा."
        ),
        "reply_te": (
            "🚨 **అత్యవసర పరిస్థితి: పశువు కడుపుబ్బరం (గ్యాస్ నిండడం)**\n"
            "కడుపులో అధికంగా గ్యాస్ చేరడం వల్ల ఊపిరితిత్తులపై ఒత్తిడి పెరిగి ఊపిరాడక పశువు చనిపోయే ప్రమాదం ఉంది.\n"
            "**వెంటనే చేయవలసిన పనులు:**\n"
            "1. పశువును పడుకోనివ్వకండి, నెమ్మదిగా నడిపిస్తూ తల ఎత్తుగా ఉంచండి.\n"
            "2. **ఇంటి చిట్కా:** 200 మి.లీ ఆవనూనె లేదా మంచి నూనెలో 20 గ్రాముల ఇంగువ, సొంటి పొడి కలిపి తాగించండి.\n"
            "3. నోట్లో అడ్డంగా కర్ర లేదా తాడు కట్టండి, తద్వారా పశువు నమలడం ద్వారా తేన్పులు వచ్చి గ్యాస్ బయటకు పోతుంది.\n"
            "4. పరిస్థితి విషమిస్తే ఆలస్యం చేయకుండా వెటర్నరీ డాక్టర్ ను సంప్రదించండి."
        ),
        "suggested_questions": [
            "अफारा किस कारण से होता है?",
            "पोट फुगल्यावर काय काळजी घ्यावी?",
            "కడుపుబ్బరానికి తక్షణ మందు ఏమిటి?",
            "ट्रोकार कैन्युला कब इस्तेमाल किया जाता है?"
        ]
    },
    {
        "keywords": [
            "mastitis", "thanela", "than", "doodh", "chhihda", "clot", "थनैल", "दूध में खून",
            "कास", "स्तनदाह", "थनेला", "रक्त", "పొదుగు", "పొదుగువాపు", "పాలలో రక్తం", "గడ్డలు"
        ],
        "intent": "MASTITIS_CARE",
        "title": "Mastitis / Udder Infection (थनैला रोग / स्तनदाह / పొదుగువాపు)",
        "reply_en": (
            "Mastitis causes severe milk loss and permanent udder damage if untreated.\n"
            "**Care Instructions:**\n"
            "1. **Frequent Milking:** Strip the affected quarter completely every 2 hours into a separate container (discard milk).\n"
            "2. **Cold Therapy:** Apply ice packs or cold water splash on the hot udder to reduce pain.\n"
            "3. **Teat Dip:** Dip teats in 0.5% povidone-iodine after milking.\n"
            "4. **Antibiotic Stewardship:** If treated with intramammary antibiotics, **DO NOT SELL OR CONSUME MILK** for 72-96 hours (withdrawal period)."
        ),
        "reply_hi": (
            "थनैला (Mastitis) से पशु के अयन में सूजन, दर्द और दूध में छीछड़े/खून आने लगता है।\n"
            "**जरूरी सावधानियां:**\n"
            "1. **दूध बार-बार निकालें:** प्रभावित थन का दूध हर 2 घंटे में अलग बर्तन में निकालें और फेंक दें।\n"
            "2. **ठंडी सिकाई:** थन गर्म व सूजा हो तो बर्फ या ठंडे पानी से सिकाई करें।\n"
            "3. **दूध की स्वच्छता:** दुहने के बाद थनों को लाल दवा या आयोडीन के घोल में डुबोएं (Teat Dip)।\n"
            "4. **सावधानी:** थन में एंटीबायोटिक दवा चढ़ाने के बाद कम से कम 3 से 4 दिन तक वह दूध मनुष्यों के पीने योग्य नहीं होता।"
        ),
        "reply_mr": (
            "स्तनदाह / थनेला (Mastitis) मुळे कासेवर सूज येऊन दुधात गुठळ्या किंवा रक्त येते.\n"
            "**महत्त्वाची काळजी:**\n"
            "१. **दूध पिळून काढणे:** बाधित स्तनातून दर २ तासांनी खराब दूध वेगळ्या भांड्यात पिळून नष्ट करा.\n"
            "२. **थंड शेक:** कास गरम व सुजलेली असल्यास बर्फाने किंवा थंड पाण्याने शेका.\n"
            "३. **स्वच्छता:** धार काढल्यानंतर सड आयोडीनच्या द्रावणात बुडवा.\n"
            "४. **नियम:** अँटिबायोटिक औषध दिल्यानंतर ४ ते ५ दिवस ते दूध विकू नका किंवा पिऊ नका."
        ),
        "reply_te": (
            "పొదుగువాపు (Mastitis) వల్ల పాల ఉత్పత్తి తగ్గి పొదుగు గట్టిపడి పాలలో గడ్డలు లేదా రక్తం వస్తుంది.\n"
            "**జాగ్రత్తలు:**\n"
            "1. **పాలు పిండడం:** వ్యాధి సోకిన చను నుండి ప్రతి 2 గంటలకు పాలను పూర్తిగా పిండి బయట పారబోయండి.\n"
            "2. **చల్లటి కాపడం:** పొదుగు వేడిగా ఉంటే చల్లటి నీరు లేదా ఐస్ తో కాపడం పెట్టండి.\n"
            "3. **పరిశుభ్రత:** పాలు పితికిన తర్వాత చనులను అయోడిన్ ద్రావణంలో ముంచండి.\n"
            "4. **యాంటీబయోటిక్ నియమం:** మందులు వాడినప్పుడు 3 నుండి 5 రోజుల వరకు ఆ పాలను తాగడం కానీ విక్రయించడం కానీ చేయరాదు."
        ),
        "suggested_questions": [
            "थनैला रोग से बचाव कैसे करें?",
            "दूध निकालने का सही तरीका क्या है?",
            "स्तनदाहावर घरगुती उपाय काय?",
            "పొదుగువాపు వ్యాధి రాకుండా ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?"
        ]
    },
    {
        "keywords": [
            "withdrawal", "dawa", "doodh", "mans", "safety", "antibiotic", "दवा का असर",
            "औषध", "निकासी", "మందుల ప్రభావం", "విత్ డ్రాయల్", "యాంటీబయోటిక్స్"
        ],
        "intent": "WITHDRAWAL_STEWARDSHIP",
        "title": "Antimicrobial Withdrawal Period (दवा निकासी अवधि / औषध विश्रांती काळ)",
        "reply_en": (
            "**Why Antimicrobial Withdrawal Matters:**\n"
            "When cows/buffaloes are injected with antibiotics (e.g. Ceftiofur, Oxytetracycline, Enrofloxacin), drug residues remain in milk and meat.\n"
            "• Drinking this milk causes antibiotic resistance and kidney/liver risks in children.\n"
            "• **Standard Withdrawal Times:**\n"
            "  - Intramammary tubes: 3 to 5 days milk withdrawal.\n"
            "  - Long-Acting Oxytetracycline: 7 days milk / 21 days meat.\n"
            "  - Ceftiofur: 0-3 days milk (check formulation) / 4 days meat.\n"
            "Always consult your attending veterinarian regarding the exact safe clearance date."
        ),
        "reply_hi": (
            "**एंटीबायोटिक दवा निकासी अवधि (Withdrawal Period):**\n"
            "जब पशु को गंभीर बीमारी में एंटीबायोटिक इंजेक्शन या थन की दवा दी जाती है, तो उसका असर दूध और मांस में रहता है।\n"
            "• ऐसा दूध पीने से बच्चों व वयस्कों में दवाओं के प्रति प्रतिरोध (Antibiotic Resistance) पैदा होता है।\n"
            "• **औसत सुरक्षित समय:**\n"
            "  - थन की नलियां (Intramammary): 3 से 5 दिन तक दूध न बेचें/न पिएं।\n"
            "  - लंबी अवधि का ऑक्सीटेट्रासाइक्लिन (LA): 7 दिन दूध / 21 दिन मांस।\n"
            "  - सेफ्टियोफर: 3 से 4 दिन का परहेज़ रखें।\n"
            "उपचार करने वाले पशु चिकित्सक से दवा का निकासी समय अवश्य पूछें।"
        ),
        "reply_mr": (
            "**अँटिबायोटिक औषध विश्रांती काळ (Withdrawal Period):**\n"
            "जनावरांना प्रतिजैविके (Antibiotics) दिल्यावर औषधाचा अंश दूध आणि मांसात उतरतो.\n"
            "• असे दूध पिण्याने मानवी आरोग्यास आणि लहान मुलांच्या प्रतिकारशक्तीस मोठा धोका निर्माण होतो.\n"
            "• **सुरक्षित कालावधी:**\n"
            "  - कासेत सोडलेली औषधे: ३ ते ५ दिवस दूध वापरू नका.\n"
            "  - ऑक्झिटेट्रासायक्लिन इंजेक्शन: ७ दिवस दूध व २१ दिवस मांस वापरू नये.\n"
            "पशुवैद्यक डॉक्टरांकडून औषधाचा विश्रांती काळ विचारून घ्या."
        ),
        "reply_te": (
            "**యాంటీబయోటిక్ విత్‌డ్రాయల్ పిరియడ్ (మందుల విరామ సమయం):**\n"
            "పశువులకు యాంటీబయోటిక్ ఇంజెక్షన్లు ఇచ్చినప్పుడు ఆ మందుల అవశేషాలు పాలు మరియు మాంసంలో ఉంటాయి.\n"
            "• అటువంటి పాలు తాగడం వల్ల మనుషులలో యాంటీబయోటిక్ రెసిస్టెన్స్ వచ్చి మందులు పనిచేయకుండా పోతాయి.\n"
            "• **సురక్షిత కాలం:**\n"
            "  - చనులలోకి ఎక్కించే మందులు: 3 నుండి 5 రోజుల వరకు పాలను వినియోగించరాదు.\n"
            "  - ఆక్సిటెట్రాసైక్లిన్: 7 రోజుల వరకు పాలు మరియు 21 రోజుల వరకు మాంసం వాడకూడదు.\n"
            "పశువైద్యుడిని సంప్రదించి సురక్షిత గడువును తెలుసుకోండి."
        ),
        "suggested_questions": [
            "क्या बीमार पशु का दूध गर्म करके पी सकते हैं?",
            "औषध दिल्यानंतर किती दिवस दूध विकू नये?",
            "యాంటీబయోటిక్స్ వాడిన తర్వాత పాలు తాగవచ్చా?"
        ]
    },
    {
        "keywords": [
            "vaccine", "tikakaran", "calendar", "time", "due", "schedule", "टीका", "टीकाकरण",
            "लस", "लसीकरण", "कॅलेंडर", "టీకాలు", "క్యాలెండర్", "షెడ్యూల్"
        ],
        "intent": "VACCINATION_SCHEDULE",
        "title": "National Livestock Vaccination Calendar (टीकाकरण कैलेंडर / लसीकरण वेळापत्रक)",
        "reply_en": (
            "**Standard Indian Livestock Vaccination Calendar:**\n"
            "1. **Foot-and-Mouth Disease (FMD):** Age 4+ months. Twice a year (Pre-monsoon: May; Pre-winter: Nov).\n"
            "2. **Hemorrhagic Septicemia (HS / Galghontu):** Age 6+ months. Annually before monsoon (May-June).\n"
            "3. **Blackleg / Black Quarter (BQ):** Age 6+ months. Annually in May-June.\n"
            "4. **Brucellosis (S19):** Female calves only, aged 4 to 8 months. **ONCE in a lifetime** (creates lifelong immunity).\n"
            "5. **PPR (Goat Plague):** Sheep & goats aged 4+ months. Once every 3 years."
        ),
        "reply_hi": (
            "**पशु टीकाकरण कैलेंडर:**\n"
            "1. **खुरपका-मुंहपका (FMD):** 4 माह से बड़े पशुओं को वर्ष में 2 बार (मई व नवंबर में)।\n"
            "2. **गलघोंटू (HS):** वर्षा ऋतु से पूर्व (मई-जून) में हर वर्ष एक बार।\n"
            "3. **लंगड़ा बुखार (BQ):** वर्षा से पूर्व (मई-जून) में हर वर्ष एक बार।\n"
            "4. **संक्रामक गर्भपात (Brucellosis):** 4 से 8 माह की बछड़ियों/कटड़ियों को **जीवन में केवल एक बार**।\n"
            "5. **बकरी प्लेग (PPR):** भेड़-बकरियों को 3 वर्ष में एक बार।"
        ),
        "reply_mr": (
            "**पशुधन लसीकरण वेळापत्रक:**\n"
            "१. **लाळ्या खुरकूत (FMD):** ४ महिन्यांवरील जनावरांना वर्षातून २ वेळा (मे व नोव्हेंबर).\n"
            "२. **घटसर्प (HS):** पावसाळ्यापूर्वी (मे-जून) दरवर्षी एकदा.\n"
            "३. **फऱ्या (BQ):** पावसाळ्यापूर्वी दरवर्षी एकदा.\n"
            "४. **ब्रुसेलोसिस (Brucellosis):** ४ ते ८ महिन्यांच्या कालवडींना **आयुष्यात एकदाच**.\n"
            "५. **शेळी-मेंढी प्लेग (PPR):** शेळ्या-मेंढ्यांना दर ३ वर्षांतून एकदा."
        ),
        "reply_te": (
            "**పశువుల టీకాల క్యాలెండర్:**\n"
            "1. **గాలికుంటు వ్యాధి (FMD):** 4 నెలలు దాటిన పశువులకు సంవత్సరానికి 2 సార్లు (మే మరియు నవంబర్).\n"
            "2. **గొంతువాపు (HS):** వర్షాకాలం ముందు (మే-జూన్) సంవత్సరానికి ఒకసారి.\n"
            "3. **జబ్బవాపు (BQ):** వర్షాకాలం ముందు సంవత్సరానికి ఒకసారి.\n"
            "4. **బ్రూసెల్లోసిస్:** 4-8 నెలల ఆడ దూడలకు **జీవితంలో ఒకే ఒక్కసారి**.\n"
            "5. **పి.పి.ఆర్ (గొర్రెలు-మేకల వ్యాధి):** ప్రతి 3 సంవత్సరాలకు ఒకసారి."
        ),
        "suggested_questions": [
            "गर्भवती गाय को कौन सा टीका नहीं लगाना चाहिए?",
            "लसीकरणानंतर ताप आल्यास काय करावे?",
            "పశువుల టీకాలు ఎక్కడ ఉచితంగా వేస్తారు?"
        ]
    }
]

DEFAULT_FALLBACK = {
    "title": "Pashu Suraksha Veterinary AI Guidance",
    "reply_en": (
        "Thank you for contacting Pashu AI Sahayak. I can assist you with disease diagnosis, first-aid, "
        "vaccination schedules, withdrawal times, and emergency outbreak protocols for Cattle, Buffalo, Goat, Sheep, and Poultry.\n\n"
        "💡 **Try asking:**\n"
        "• 'What should I do if my cow has blisters in mouth?'\n"
        "• 'How to prevent Lumpy Skin Disease?'\n"
        "• 'Emergency care for animal bloat / swollen belly'\n"
        "• 'FMD vaccination due dates'\n"
        "• 'Is milk safe to drink after antibiotic injection?'"
    ),
    "reply_hi": (
        "पशु एआई सहायक में आपका स्वागत है। मैं गाय, भैंस, भेड़, बकरी और मुर्गियों के रोगों, प्राथमिक उपचार, "
        "टीकाकरण और आपातकालीन सतर्कता के बारे में आपकी सहायता कर सकता हूँ।\n\n"
        "💡 **आप मुझसे पूछ सकते हैं:**\n"
        "• 'गाय के मुंह व खुर में छाले हैं, क्या करें?'\n"
        "• 'लम्पी स्किन रोग से बचाव के उपाय'\n"
        "• 'पशु का पेट फूलने (अफारा) का तुरंत उपचार'\n"
        "• 'गलघोंटू और मुंहपका का टीका कब लगता है?'\n"
        "• 'एंटीबायोटिक इंजेक्शन के बाद कितने दिन दूध नहीं बेचना चाहिए?'"
    ),
    "reply_mr": (
        "पशु एआय सहाय्यक मध्ये आपले स्वागत आहे! मी गाय, म्हैस, शेळी, मेंढी यांच्या आजारांचे निदान, प्राथमिक उपचार, "
        "लसीकरण वेळापत्रक आणि तातडीच्या उपाययोजनांबद्दल आपल्याला मार्गदर्शन करू शकतो.\n\n"
        "💡 **आपण विचारू शकता:**\n"
        "• 'गाईच्या तोंडात आणि खुरांमध्ये फोड आहेत, काय उपाय करावा?'\n"
        "• 'लम्पी त्वचा रोगापासून बचावाचे घरगुती उपाय'\n"
        "• 'जनावराचे पोट फुगल्यावर त्वरित काय करावे?'\n"
        "• 'लाळ्या खुरकूत आणि घटसर्प लस कधी टोचावी?'\n"
        "• 'अँटिबायोटिक औषध दिल्यानंतर किती दिवस दूध विकू नये?'"
    ),
    "reply_te": (
        "పశు ఏఐ సహాయక్ కి స్వాగతం! ఆవులు, గేదెలు, గొర్రెలు మరియు మేకల వ్యాధులు, ప్రాథమిక చికిత్స, "
        "టీకాల సమాచారం మరియు అత్యవసర జాగ్రత్తల గురించి మీకు సహాయం చేయడానికి నేను సిద్ధంగా ఉన్నాను.\n\n"
        "💡 **మీరు నన్ను అడగవచ్చు:**\n"
        "• 'ఆవు నోరు మరియు గిట్టల వద్ద బొబ్బలు ఉంటే ఏమి చేయాలి?'\n"
        "• 'లంపీ స్కిన్ వ్యాధి నివారణ చర్యలు'\n"
        "• 'పశువుకు కడుపుబ్బరం వచ్చినప్పుడు తక్షణ చికిత్స'\n"
        "• 'గాలికుంటు టీకాలు ఎప్పుడు వేయించాలి?'\n"
        "• 'యాంటీబయోటిక్ ఇచ్చిన తర్వాత ఎన్ని రోజులు పాలు వాడకూడదు?'"
    ),
    "suggested_questions": [
        "गाय के मुंह में छाले हैं क्या करें?",
        "लम्पी रोग से बचाव के घरेलू उपाय",
        "गाईचे पोट फुगल्यावर काय करावे?",
        "గాలికుంటు వ్యాధి నివారణ చర్యలు"
    ]
}


def process_chat_message(user_message: str, language: str = "hi") -> Dict[str, Any]:
    """
    Processes farmer query, matches veterinary intents, and returns localized actionable response
    supporting English, Hindi, Marathi, and Telugu.
    """
    msg_clean = user_message.strip().lower()
    
    matched_entry = None
    best_score = 0
    
    for entry in CHATBOT_KNOWLEDGE:
        score = sum(1 for kw in entry["keywords"] if kw in msg_clean)
        if score > best_score:
            best_score = score
            matched_entry = entry
            
    if not matched_entry or best_score == 0:
        matched_entry = DEFAULT_FALLBACK
        
    # Pick language-appropriate reply
    lang_key = f"reply_{language}"
    reply_text = matched_entry.get(lang_key)
    if not reply_text:
        reply_text = matched_entry.get("reply_hi" if language == "hi" else "reply_en") or matched_entry["reply_en"]
    
    return {
        "success": True,
        "title": matched_entry["title"],
        "intent": matched_entry.get("intent", "GENERAL_ADVISORY"),
        "is_emergency": bool(matched_entry.get("is_emergency", False)),
        "reply": reply_text,
        "suggested_questions": matched_entry.get("suggested_questions", []),
        "language": language
    }
