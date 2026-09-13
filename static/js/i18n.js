/**
 * Pashu Suraksha - Multilingual Internationalization (i18n) Engine
 * Full UI localization for Marathi (मराठी), Hindi (हिंदी), English, and Telugu (తెలుగు).
 */

const I18N_TRANSLATIONS = {
  en: {
    // Brand & Header
    brand_title: "Pashu Suraksha",
    brand_sub: "Unified Real-Time Animal Health Surveillance & Early Warning Decision Support",
    sync_online: "Online (Auto-Sync Ready)",
    sync_offline: "Offline Mode (Local Storage)",
    nav_login: "Login / Switch",
    user_dvo: "District Veterinary Officer (DVO)",

    // Navigation Tabs
    tab_map: "🗺️ Outbreak Map & GIS Surveillance",
    tab_vision: "📸 AI Vision Lens & Lesion Scan",
    tab_triage: "⚡ Rapid Syndromic Report & AI Triage",
    tab_ehr: "📋 Animal EHR & Health Passport",
    tab_labs: "🧪 Lab Referrals & Chain of Custody",
    tab_advisories: "🔊 Multilingual Voice Advisories & SMS",
    tab_ivr: "📞 Simulated IVR Hotline (1962)",
    tab_dashboard: "📈 Epidemiological Dashboard",

    // Map & GIS
    map_title: "📍 Live Geospatial Surveillance & Containment Rings",
    map_subtitle: "Active Layers: Outbreak Clusters • 3km Infected Zones • 10km Surveillance Buffers",
    map_reg_all: "🇮🇳 All India",
    map_reg_north: "🏔️ North Zone (HR/PB/UP)",
    map_reg_west: "🌾 West Zone (MH/GJ)",
    map_reg_south: "🌴 South Zone (TS/AP/KA)",
    map_reg_east: "🌅 East & Central Zone",
    legend_outbreak: "Critical Outbreak Point (Active)",
    legend_infected_zone: "3 km Infected Zone (Movement Ban)",
    legend_surv_zone: "10 km Surveillance Zone (Ring Search)",
    legend_vet: "Veterinary Dispensary / Hospital",
    legend_lab: "Regional Diagnostic Laboratory",
    env_risk_title: "🌤️ Environmental & Vector Risk",
    env_temp: "Temperature",
    env_humidity: "Relative Humidity",
    env_rain: "Precipitation (24h)",
    env_wind: "Wind Speed",
    env_vector_suit: "🪰 Vector Suitability (Midges & Ticks)",
    env_fmd_disp: "💨 FMD Airborne Dispersion Potential",
    env_hs_water: "🌧️ Waterlogging Stress (HS / Galghontu)",
    btn_emergency_alert: "📢 Issue Multilingual Village Alert",
    btn_check_samples: "🧪 Check Diagnostic Samples in Transit",

    // Vision Lens
    vision_title: "📸 AI Visual Lesion Scanner & Camera Lens",
    vision_badge: "Computer Vision AI",
    vision_target_label: "🎯 Select Target Body Region / Scan Mode:",
    target_auto: "🔍 Auto-Detect (Visual AI)",
    target_healthy: "🐄 Routine Healthy Check",
    target_skin: "⚪ Skin Coat (LSD Nodules)",
    target_mouth: "👅 Mouth & Hoof (FMD Ulcers)",
    target_udder: "🥛 Udder & Teats (Mastitis)",
    target_throat: "🧣 Throat & Brisket (HS)",
    target_ticks: "🪰 Parasites (Ticks / Chichdi)",
    vision_drop_title: "Snap or Upload Lesion Photo",
    vision_drop_sub: "Tap to open camera, browse gallery, or drag-and-drop animal photo",
    btn_launch_camera: "📸 Launch Mobile Camera",
    btn_browse_files: "📁 Browse Device Photos",
    btn_scan_another: "🔄 Scan Another Photo",
    presets_label: "⚡ Or Test With Standard Pathology Presets (No Camera Needed):",
    preset_lsd: "⚪ LSD Skin Nodules",
    preset_fmd: "👅 FMD Oral Blisters",
    preset_mastitis: "🥛 Udder Mastitis",
    preset_ticks: "🪰 Tick Parasites",
    preset_anthrax: "⚠️ Anthrax Post-Mortem",
    preset_hs: "🧣 HS Neck Edema",
    preset_healthy: "🐄 Healthy Cattle Baseline",
    standby_title: "AI Vision Diagnostics Standby",
    standby_desc: "Capture or upload a photo of the animal's skin, mouth, hooves, or udder to detect disease lesions, clinical stage, and emergency first-aid.",
    btn_auto_fill: "📝 Auto-Fill Official Disease Report",
    btn_ask_ai: "💬 Ask AI Chatbot About This",

    // Triage & Reporting
    triage_form_title: "📝 Field Case & Mortality Reporting",
    triage_form_badge: "Offline-Enabled Form",
    reporter_type: "Reporter Type",
    reporter_name: "Reporter Name",
    reporter_phone: "Mobile Contact (10 digits)",
    animal_tag: "Animal Ear Tag / RFID (Optional)",
    select_species: "Affected Livestock Species",
    village: "Village / Gram Panchayat",
    block: "Block / Tehsil",
    district: "District",
    symptoms_header: "Observed Clinical Symptoms & Hallmarks",
    fever_label: "Animal has high rectal temperature / fever (>103°F)",
    affected_count: "Number of Animals Showing Symptoms",
    mortality_count: "Number of Recent Mortalities / Deaths",
    notes: "Clinical Observations & Lesion Notes",
    btn_submit_report: "🚀 Submit Syndromic Report to District Surveillance",

    // EHR & Passport
    ehr_title: "Animal Health Record (EHR) & Passport",
    ehr_search_placeholder: "Search by 12-digit Tag Number or Owner Name...",
    btn_search: "Search Record",
    btn_register_new: "➕ Register New Animal Tag",

    // Chatbot Drawer
    chat_header: "Pashu AI Veterinary Sahayak",
    chat_placeholder: "Ask about symptoms, first-aid, vaccines, withdrawal periods...",
    chat_send: "Send"
  },

  hi: {
    // Brand & Header
    brand_title: "पशु सुरक्षा (Pashu Suraksha)",
    brand_sub: "एकीकृत रीयल-टाइम पशु स्वास्थ्य निगरानी एवं पूर्व चेतावनी निर्णय प्रणाली",
    sync_online: "ऑनलाइन (स्वतः सिंक तैयार)",
    sync_offline: "ऑफ़लाइन मोड (स्थानीय डेटा)",
    nav_login: "लॉगिन / बदलें",
    user_dvo: "जिला पशु चिकित्सा अधिकारी (DVO)",

    // Navigation Tabs
    tab_map: "🗺️ प्रकोप मानचित्र एवं जीआईएस",
    tab_vision: "📸 एआई विजन लेंस एवं घाव जांच",
    tab_triage: "⚡ त्वरित लक्षण रिपोर्ट एवं ट्राइएज",
    tab_ehr: "📋 पशु ईएचआर एवं स्वास्थ्य पासपोर्ट",
    tab_labs: "🧪 प्रयोगशाला रेफरल व नमूने",
    tab_advisories: "🔊 बहुभाषी वॉइस परामर्श एवं एसएमएस",
    tab_ivr: "📞 आईवीआर हेल्पलाइन (1962)",
    tab_dashboard: "📈 महामारी विज्ञान डैशबोर्ड",

    // Map & GIS
    map_title: "📍 लाइव भौगोलिक निगरानी एवं नियंत्रण चक्र",
    map_subtitle: "सक्रिय परतें: प्रकोप क्लस्टर • 3 किमी संक्रमित क्षेत्र • 10 किमी निगरानी बफर",
    map_reg_all: "🇮🇳 संपूर्ण भारत",
    map_reg_north: "🏔️ उत्तर भारत (HR/PB/UP)",
    map_reg_west: "🌾 पश्चिम भारत (महाराष्ट्र/गुजरात)",
    map_reg_south: "🌴 दक्षिण भारत (तेलंगाना/AP/KA)",
    map_reg_east: "🌅 पूर्व व मध्य भारत",
    legend_outbreak: "सक्रिय प्रकोप केंद्र (पुष्ट)",
    legend_infected_zone: "3 किमी संक्रमित क्षेत्र (आवागमन प्रतिबंध)",
    legend_surv_zone: "10 किमी निगरानी क्षेत्र (रिंग सर्च व टीकाकरण)",
    legend_vet: "पशु औषधालय / अस्पताल",
    legend_lab: "क्षेत्रीय रोग निदान प्रयोगशाला",
    env_risk_title: "🌤️ मौसम व रोग-वाहक (Vector) जोखिम",
    env_temp: "तापमान",
    env_humidity: "आपेक्षिक आर्द्रता",
    env_rain: "वर्षा (24 घंटे)",
    env_wind: "हवा की गति",
    env_vector_suit: "🪰 मक्खी-मच्छर व किलनी अनुकूलता",
    env_fmd_disp: "💨 FMD हवा से फैलने की संभावना",
    env_hs_water: "🌧️ जलभराव व गलघोंटू (HS) जोखिम",
    btn_emergency_alert: "📢 बहुभाषी ग्राम चेतावनी जारी करें",
    btn_check_samples: "🧪 मार्ग में जांच नमूनों की स्थिति देखें",

    // Vision Lens
    vision_title: "📸 एआई विजन लेंस एवं घाव स्कैनर",
    vision_badge: "कंप्यूटर विज़न एआई",
    vision_target_label: "🎯 शरीर का अंग या जांच का प्रकार चुनें:",
    target_auto: "🔍 स्वतः पहचान (Auto-Detect AI)",
    target_healthy: "🐄 सामान्य स्वस्थ पशु जांच",
    target_skin: "⚪ त्वचा व गांठ (लम्पी रोग)",
    target_mouth: "👅 मुंह व खुर (खुरपका-मुंहपका)",
    target_udder: "🥛 थन व अयन (थनैला रोग)",
    target_throat: "🧣 गला व गलकंबल (गलघोंटू)",
    target_ticks: "🪰 बाह्य परजीवी (चिचड़ी / किलनी)",
    vision_drop_title: "पशु के घाव या त्वचा की फोटो लें अथवा अपलोड करें",
    vision_drop_sub: "कैमरा खोलने, गैलरी से फोटो चुनने अथवा फोटो खींचकर यहां डालने हेतु टैप करें",
    btn_launch_camera: "📸 मोबाइल कैमरा शुरू करें",
    btn_browse_files: "📁 गैलरी से फोटो चुनें",
    btn_scan_another: "🔄 अन्य फोटो स्कैन करें",
    presets_label: "⚡ या मानक बीमारी नमूनों से तुरंत परीक्षण करें (कैमरा आवश्यक नहीं):",
    preset_lsd: "⚪ लम्पी त्वचा गांठें",
    preset_fmd: "👅 मुंहपका-खुरपका छाले",
    preset_mastitis: "🥛 थनैला रोग सूजन",
    preset_ticks: "🪰 चिचड़ी / किलनी गुच्छे",
    preset_anthrax: "⚠️ एंथ्रेक्स संदिग्ध शव",
    preset_hs: "🧣 गलघोंटू गर्दन सूजन",
    preset_healthy: "🐄 सामान्य स्वस्थ पशु",
    standby_title: "एआई विजन जांच स्टैंडबाय",
    standby_desc: "पशु की त्वचा, मुंह, खुर या थन की फोटो अपलोड करें ताकि एआई तुरंत बीमारी की पहचान, अवस्था और प्राथमिक उपचार बता सके।",
    btn_auto_fill: "📝 इस जांच को सीधे रोग रिपोर्ट में भरें",
    btn_ask_ai: "💬 एआई चैटबॉट से इस बारे में पूछें",

    // Triage & Reporting
    triage_form_title: "📝 बीमारी एवं मृत्यु की प्राथमिक सूचना रिपोर्ट",
    triage_form_badge: "ऑफ़लाइन सक्षम फॉर्म",
    reporter_type: "रिपोर्टर का प्रकार",
    reporter_name: "रिपोर्टर का नाम",
    reporter_phone: "मोबाइल नंबर (10 अंक)",
    animal_tag: "पशु का कान का टैग / RFID (वैकल्पिक)",
    select_species: "पशु की प्रजाति",
    village: "गांव / ग्राम पंचायत",
    block: "ब्लॉक / तहसील",
    district: "जिला",
    symptoms_header: "पशु में दिखाई देने वाले प्रमुख लक्षण",
    fever_label: "पशु को तेज बुखार है (>103°F)",
    affected_count: "बीमार पशुओं की कुल संख्या",
    mortality_count: "हाल ही में मृत पशुओं की संख्या",
    notes: "अन्य लक्षण एवं महत्वपूर्ण जानकारी",
    btn_submit_report: "🚀 जिला निगरानी केंद्र को रिपोर्ट भेजें",

    // EHR & Passport
    ehr_title: "पशु ईएचआर एवं डिजिटल स्वास्थ्य कार्ड",
    ehr_search_placeholder: "12-अंकों के टैग नंबर या पशुपालक के नाम से खोजें...",
    btn_search: "रिकॉर्ड खोजें",
    btn_register_new: "➕ नया पशु पंजीकृत करें",

    // Chatbot Drawer
    chat_header: "पशु एआई पशुचिकित्सा सहायक",
    chat_placeholder: "लक्षण, उपचार, टीके व दवा के असर के बारे में पूछें...",
    chat_send: "भेजें"
  },

  mr: {
    // Brand & Header
    brand_title: "पशु सुरक्षा (Pashu Suraksha)",
    brand_sub: "एकात्मिक रीअल-टाईम पशु आरोग्य देखरेख आणि पूर्वसूचना निर्णय प्रणाली",
    sync_online: "ऑनलाइन (ऑटो-सिंक सज्ज)",
    sync_offline: "ऑफलाइन मोड (स्थानिक डेटा)",
    nav_login: "लॉगिन / बदला",
    user_dvo: "जिल्हा पशुवैद्यकीय अधिकारी (DVO)",

    // Navigation Tabs
    tab_map: "🗺️ प्रकोप नकाशा आणि जीआयएस",
    tab_vision: "📸 एआय व्हिजन लेन्स आणि तपासणी",
    tab_triage: "⚡ तातडीचा लक्षण अहवाल व ट्रायज",
    tab_ehr: "📋 पशु आरोग्य पत्रिका (EHR)",
    tab_labs: "🧪 प्रयोगशाळा तपासणी व नमुने",
    tab_advisories: "🔊 बहुभाषिक ध्वनी सूचना व एसएमएस",
    tab_ivr: "📞 आयव्हीआर हेल्पलाईन (१९६२)",
    tab_dashboard: "📈 रोग अन्वेषण डॅशबोर्ड",

    // Map & GIS
    map_title: "📍 थेट भौगोलिक देखरेख आणि नियंत्रण रिंग्ज",
    map_subtitle: "सक्रिय स्तर: प्रकोप क्लस्टर • ३ किमी बाधित क्षेत्र • १० किमी देखरेख बफर",
    map_reg_all: "🇮🇳 संपूर्ण भारत",
    map_reg_north: "🏔️ उत्तर भारत (HR/PB/UP)",
    map_reg_west: "🌾 पश्चिम भारत (महाराष्ट्र/गुजरात)",
    map_reg_south: "🌴 दक्षिण भारत (तेलंगणा/AP/KA)",
    map_reg_east: "🌅 पूर्व व मध्य भारत",
    legend_outbreak: "सक्रिय उद्रेक केंद्र (निश्चित)",
    legend_infected_zone: "३ किमी बाधित क्षेत्र (वाहतूक बंदी)",
    legend_surv_zone: "१० किमी देखरेख क्षेत्र (लसीकरण व शोध)",
    legend_vet: "पशुवैद्यकीय दवाखाना / रुग्णालय",
    legend_lab: "प्रादेशिक रोग निदान प्रयोगशाळा",
    env_risk_title: "🌤️ हवामान व रोग-वाहक (Vector) धोका",
    env_temp: "तापमान",
    env_humidity: "सापेक्ष आर्द्रता",
    env_rain: "पाऊस (२४ तास)",
    env_wind: "वाऱ्याचा वेग",
    env_vector_suit: "🪰 डास, माश्या व गोचीड अनुकूलता",
    env_fmd_disp: "💨 लाळ्या खुरकूत हवेतून प्रसार धोका",
    env_hs_water: "🌧️ पाणी साचणे व घटसर्प (HS) धोका",
    btn_emergency_alert: "📢 बहुभाषिक गाव सतर्कता जारी करा",
    btn_check_samples: "🧪 तपासणी नमुन्यांची स्थिती पहा",

    // Vision Lens
    vision_title: "📸 एआय व्हिजन लेन्स आणि जखम तपासणी",
    vision_badge: "कॉम्प्युटर व्हिजन एआय",
    vision_target_label: "🎯 शरीराचा भाग किंवा तपासणी प्रकार निवडा:",
    target_auto: "🔍 स्वयंचलित ओळख (Auto-Detect AI)",
    target_healthy: "🐄 सामान्य निरोगी जनावर तपासणी",
    target_skin: "⚪ कातडी व गाठी (लम्पी त्वचा रोग)",
    target_mouth: "👅 तोंड व खूर (लाळ्या खुरकूत)",
    target_udder: "🥛 कास व सड (स्तनदाह / थनेला)",
    target_throat: "🧣 गळा व छाती (घटसर्प)",
    target_ticks: "🪰 बाह्य परजीवी (गोचीड प्रादुर्भाव)",
    vision_drop_title: "जनावराच्या जखमेचा किंवा त्वचेचा फोटो काढा किंवा अपलोड करा",
    vision_drop_sub: "कॅमेरा उघडण्यासाठी, गॅलरीतून फोटो निवडण्यासाठी किंवा येथे ड्रॅग करण्यासाठी टॅप करा",
    btn_launch_camera: "📸 मोबाईल कॅमेरा सुरू करा",
    btn_browse_files: "📁 गॅलरीतून फोटो निवडा",
    btn_scan_another: "🔄 दुसरा फोटो स्कॅन करा",
    presets_label: "⚡ किंवा मानक नमुन्यांसह लगेच चाचणी करा (कॅमेरा आवश्यक नाही):",
    preset_lsd: "⚪ लम्पी त्वचा गाठी",
    preset_fmd: "👅 लाळ्या खुरकूत फोड",
    preset_mastitis: "🥛 स्तनदाह कास सूज",
    preset_ticks: "🪰 गोचीड पुंजके",
    preset_anthrax: "⚠️ संशयित अँथ्रॅक्स शव",
    preset_hs: "🧣 घटसर्प गळा सूज",
    preset_healthy: "🐄 निरोगी जनावर नमुना",
    standby_title: "एआय व्हिजन निदान सज्ज",
    standby_desc: "जनावराची कातडी, तोंड, खूर किंवा कासेचा फोटो अपलोड करा, जेणेकरून एआय आजाराचे त्वरित निदान आणि प्रथमोपचार सुचवेल.",
    btn_auto_fill: "📝 ही तपासणी थेट आजार अहवालात जोडा",
    btn_ask_ai: "💬 एआय चॅटबॉटला याबद्दल विचारा",

    // Triage & Reporting
    triage_form_title: "📝 आजार व मृत्यू नोंदणी प्राथमिक अहवाल",
    triage_form_badge: "ऑफलाइन सक्षम फॉर्म",
    reporter_type: "नोंद करणाऱ्याचा प्रकार",
    reporter_name: "नोंद करणाऱ्याचे नाव",
    reporter_phone: "मोबाईल नंबर (१० अंक)",
    animal_tag: "जनावराचा कान टॅग / RFID (ऐच्छिक)",
    select_species: "बाधित जनावराचा प्रकार",
    village: "गाव / ग्रामपंचायत",
    block: "तालुका",
    district: "जिल्हा",
    symptoms_header: "जनावरांमध्ये दिसणारी प्रमुख लक्षणे",
    fever_label: "जनावराला तीव्र ताप आहे (>१०३°F)",
    affected_count: "आजारी जनावरांची एकूण संख्या",
    mortality_count: "नुकत्याच मृत पावलेल्या जनावरांची संख्या",
    notes: "इतर निरीक्षणे व महत्त्वाची माहिती",
    btn_submit_report: "🚀 जिल्हा नियंत्रण कक्षाला अहवाल पाठवा",

    // EHR & Passport
    ehr_title: "पशु आरोग्य नोंदवही (EHR) व डिजिटल कार्ड",
    ehr_search_placeholder: "१२ अंकी टॅग क्रमांक किंवा मालकाच्या नावाने शोधा...",
    btn_search: "माहिती शोधा",
    btn_register_new: "➕ नवीन जनावराची नोंदणी करा",

    // Chatbot Drawer
    chat_header: "पशु एआय पशुवैद्यकीय सहाय्यक",
    chat_placeholder: "लक्षणे, प्रथमोपचार, लस आणि औषधांबद्दल विचारा...",
    chat_send: "पाठवा"
  },

  te: {
    // Brand & Header
    brand_title: "పశు రక్ష (Pashu Suraksha)",
    brand_sub: "సమగ్ర నిజ-సమయ పశు ఆరోగ్య పర్యవేక్షణ మరియు ముందస్తు హెచ్చరిక వ్యవస్థ",
    sync_online: "ఆన్‌లైన్ (ఆటో-సింక్ సిద్ధం)",
    sync_offline: "ఆఫ్‌లైన్ మోడ్ (స్థానిక డేటా)",
    nav_login: "లాగిన్ / మార్చండి",
    user_dvo: "జిల్లా పశువైద్య అధికారి (DVO)",

    // Navigation Tabs
    tab_map: "🗺️ వ్యాధి వ్యాప్తి పటము & జీఐఎస్",
    tab_vision: "📸 ఏఐ విజన్ లెన్స్ & పుండ్ల పరీక్ష",
    tab_triage: "⚡ వేగవంతమైన వ్యాధి నివేదిక & ట్రయేజ్",
    tab_ehr: "📋 పశువుల ఈహెచ్ఆర్ & హెల్త్ పాస్ పోర్ట్",
    tab_labs: "🧪 ల్యాబ్ పరీక్షలు & నమూనాలు",
    tab_advisories: "🔊 బహుభాషా వాయిస్ హెచ్చరికలు",
    tab_ivr: "📞 ఐవీఆర్ హెల్ప్‌లైన్ (1962)",
    tab_dashboard: "📈 ఎపిడెమియోలాజికల్ డాష్ బోర్డ్",

    // Map & GIS
    map_title: "📍 ప్రత్యక్ష భౌగోళిక పర్యవేక్షణ & కట్టడి వలయాలు",
    map_subtitle: "క్రియాశీల లేయర్లు: వ్యాప్తి క్లస్టర్లు • 3 కి.మీ కట్టడి జోన్ • 10 కి.మీ నిఘా బఫర్",
    map_reg_all: "🇮🇳 అఖిల భారత పటం",
    map_reg_north: "🏔️ ఉత్తర జోన్ (HR/PB/UP)",
    map_reg_west: "🌾 పశ్చిమ జోన్ (మహారాష్ట్ర/గుజరాత్)",
    map_reg_south: "🌴 దక్షిణ జోన్ (తెలంగాణ/AP/KA)",
    map_reg_east: "🌅 తూర్పు & మధ్య జోన్",
    legend_outbreak: "తీవ్ర వ్యాప్తి కేంద్రం (ధృవీకరించబడింది)",
    legend_infected_zone: "3 కి.మీ ప్రభావిత ప్రాంతం (రవాణా నిషేధం)",
    legend_surv_zone: "10 కి.మీ నిఘా ప్రాంతం (టీకాలు & శోధన)",
    legend_vet: "పశు వైద్యశాల / ఆసుపత్రి",
    legend_lab: "ప్రాంతీయ వ్యాధి నిర్ధారణ ప్రయోగశాల",
    env_risk_title: "🌤️ వాతావరణం & వ్యాధి కారకాల ప్రమాదం",
    env_temp: "ఉష్ణోగ్రత",
    env_humidity: "గాలిలో తేమ శాతం",
    env_rain: "వర్షపాతం (24 గం)",
    env_wind: "గాలి వేగం",
    env_vector_suit: "🪰 దోమలు, ఈగలు & గోమార్ల ప్రమాదం",
    env_fmd_disp: "💨 గాలికుంటు గాలి ద్వారా వ్యాప్తి ముప్పు",
    env_hs_water: "🌧️ మురుగునీరు & గొంతువాపు (HS) ముప్పు",
    btn_emergency_alert: "📢 బహుభాషా గ్రామీణ హెచ్చరిక జారీ చేయండి",
    btn_check_samples: "🧪 ల్యాబ్ పరీక్ష నమూనాల స్థితిని చూడండి",

    // Vision Lens
    vision_title: "📸 ఏఐ విజన్ లెన్స్ & వ్యాధి గుర్తింపు",
    vision_badge: "కంప్యూటర్ విజన్ ఏఐ",
    vision_target_label: "🎯 శరీర భాగం లేదా పరీక్ష రకాన్ని ఎంచుకోండి:",
    target_auto: "🔍 ఆటోమేటిక్ గుర్తింపు (Auto-Detect)",
    target_healthy: "🐄 సాధారణ ఆరోగ్యకరమైన పశువు",
    target_skin: "⚪ చర్మం & గడ్డలు (లంపీ స్కిన్ వ్యాధి)",
    target_mouth: "👅 నోరు & గిట్టలు (గాలికుంటు వ్యాధి)",
    target_udder: "🥛 పొదుగు & చనులు (పొదుగువాపు వ్యాధి)",
    target_throat: "🧣 గొంతు & దవడ (గొంతువాపు)",
    target_ticks: "🪰 బాహ్య పరాన్నజీవులు (గోమార్లు)",
    vision_drop_title: "పుండ్లు లేదా చర్మం ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి",
    vision_drop_sub: "కెమెరాను తెరవడానికి, గ్యాలరీ నుండి ఎంచుకోవడానికి లేదా ఇక్కడ లాగడానికి నొక్కండి",
    btn_launch_camera: "📸 మొబైల్ కెమెరా ఆన్ చేయండి",
    btn_browse_files: "📁 గ్యాలరీ నుండి ఫోటో ఎంచుకోండి",
    btn_scan_another: "🔄 వేరొక ఫోటో స్కాన్ చేయండి",
    presets_label: "⚡ లేదా ప్రామాణిక నమూనాలతో పరీక్షించండి (కెమెరా అవసరం లేదు):",
    preset_lsd: "⚪ లంపీ చర్మం గడ్డలు",
    preset_fmd: "👅 గాలికుంటు నోటి బొబ్బలు",
    preset_mastitis: "🥛 పొదుగువాపు వాపు",
    preset_ticks: "🪰 గోమార్ల గుంపు",
    preset_anthrax: "⚠️ ఆంత్రాక్స్ అనుమానిత కళేబరం",
    preset_hs: "🧣 గొంతువాపు వాపు",
    preset_healthy: "🐄 ఆరోగ్యకరమైన ఆవు నమూనా",
    standby_title: "ఏఐ విజన్ నిర్ధారణ సిద్ధంగా ఉంది",
    standby_desc: "పశువు చర్మం, నోరు, గిట్టలు లేదా పొదుగు ఫోటోను అప్‌లోడ్ చేయండి; ఏఐ వ్యాధిని గుర్తించి తక్షణ చికిత్సను అందిస్తుంది.",
    btn_auto_fill: "📝 ఈ ఫలితాన్ని అధికారిక నివేదికలో చేర్చండి",
    btn_ask_ai: "💬 ఈ వ్యాధి గురించి ఏఐ చాట్‌బాట్‌ను అడగండి",

    // Triage & Reporting
    triage_form_title: "📝 పశు వ్యాధి మరియు మరణాల నివేదిక",
    triage_form_badge: "ఆఫ్‌లైన్ ఫారమ్",
    reporter_type: "నివేదించే వ్యక్తి రకం",
    reporter_name: "నివేదించే వ్యక్తి పేరు",
    reporter_phone: "మొబైల్ సంఖ్య (10 అంకెలు)",
    animal_tag: "చెవి ట్యాగ్ / RFID (ఐచ్ఛికం)",
    select_species: "ప్రభావిత పశువుల రకం",
    village: "గ్రామం / పంచాయతీ",
    block: "మండలం",
    district: "జిల్లా",
    symptoms_header: "పశువులో కనిపించిన ముఖ్య లక్షణాలు",
    fever_label: "పశువుకు తీవ్రమైన జ్వరం ఉంది (>103°F)",
    affected_count: "వ్యాధి సోకిన పశువుల సంఖ్య",
    mortality_count: "ఇటీవల మరణించిన పశువుల సంఖ్య",
    notes: "ఇతర పరిశీలనలు & ముఖ్యమైన సమాచారం",
    btn_submit_report: "🚀 జిల్లా నిఘా కేంద్రానికి నివేదిక పంపండి",

    // EHR & Passport
    ehr_title: "పశు ఆరోగ్య పత్రం (EHR) & డిజిటల్ పాస్‌పోర్ట్",
    ehr_search_placeholder: "12 అంకెల ట్యాగ్ లేదా యజమాని పేరుతో వెతకండి...",
    btn_search: "వెతకండి",
    btn_register_new: "➕ కొత్త పశువును నమోదు చేయండి",

    // Chatbot Drawer
    chat_header: "పశు ఏఐ వెటర్నరీ సహాయక్",
    chat_placeholder: "లక్షణాలు, ప్రథమ చికిత్స, టీకాలు, మందుల వివరాలు అడగండి...",
    chat_send: "పంపండి"
  }
};

class LocalizationManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('pashu_suraksha_lang') || 'hi';
    this.listeners = [];
  }

  init() {
    // Match dropdown with stored language
    const globalSelect = document.getElementById('globalLanguageSelect');
    if (globalSelect) {
      globalSelect.value = this.currentLanguage;
    }
    const chatSelect = document.getElementById('chatLanguageSelect');
    if (chatSelect) {
      chatSelect.value = this.currentLanguage;
    }

    this.applyTranslations();
  }

  setLanguage(langCode) {
    if (!I18N_TRANSLATIONS[langCode]) {
      console.warn(`Language '${langCode}' not supported, falling back to 'hi'`);
      langCode = 'hi';
    }
    this.currentLanguage = langCode;
    localStorage.setItem('pashu_suraksha_lang', langCode);

    // Sync all dropdowns
    const globalSelect = document.getElementById('globalLanguageSelect');
    if (globalSelect && globalSelect.value !== langCode) globalSelect.value = langCode;
    const chatSelect = document.getElementById('chatLanguageSelect');
    if (chatSelect && chatSelect.value !== langCode) chatSelect.value = langCode;
    const advisorySelect = document.getElementById('advisoryLangSelect');
    if (advisorySelect && advisorySelect.value !== langCode) {
      // If code exists in advisory dropdown, select it
      if ([...advisorySelect.options].some(o => o.value === langCode)) {
        advisorySelect.value = langCode;
        if (window.previewAdvisory) window.previewAdvisory();
      }
    }

    this.applyTranslations();

    // Trigger custom event for other components (maps, vision, charts)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
  }

  t(key, lang = null) {
    const l = lang || this.currentLanguage;
    const dict = I18N_TRANSLATIONS[l] || I18N_TRANSLATIONS.en;
    return dict[key] || I18N_TRANSLATIONS.en[key] || key;
  }

  applyTranslations() {
    const lang = this.currentLanguage;
    const dict = I18N_TRANSLATIONS[lang] || I18N_TRANSLATIONS.en;

    // 1. Text elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerText = dict[key];
      }
    });

    // 2. HTML elements with data-i18n-html attribute
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // 3. Inputs / Textareas with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });

    // 4. Elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key]) {
        el.title = dict[key];
      }
    });

    // Update document title
    document.title = `Pashu Suraksha | ${dict.brand_title || 'Animal Health Surveillance'}`;
  }
}

window.I18n = new LocalizationManager();
