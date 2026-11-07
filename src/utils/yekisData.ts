import { FaqItemData, SupportedLang } from './yekisMath';

export interface LanguageOption {
  code: SupportedLang;
  name: string;
  nativeName: string;
  short: string;
}

export const SUPPORTED_LANGUAGES: ReadonlyArray<LanguageOption> = [
  { code: 'en', name: 'English', nativeName: 'English', short: 'EN' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', short: 'አማ' },
  { code: 'om', name: 'Oromiffa', nativeName: 'Afaan Oromoo', short: 'ORO' },
  { code: 'ti', name: 'Tigrigna', nativeName: 'ትግርኛ', short: 'ትግ' },
];

export interface LocalizedMarketingCopy {
  nav: {
    overview: string;
    escrow: string;
    fees: string;
    categories: string;
    caseStudies: string;
    aboutFaq: string;
    signIn: string;
    getStarted: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    slogan: string;
    ctaPrimary: string;
    ctaSecondary: string;
    officeBadge: string;
  };
  stats: {
    eyebrow: string;
    heading: string;
    jobsLabel: string;
    jobsDesc: string;
    freelancersLabel: string;
    freelancersDesc: string;
    escrowLabel: string;
    escrowDesc: string;
    payoutLabel: string;
    payoutDesc: string;
  };
  escrow: {
    eyebrow: string;
    heading: string;
    subheadline: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  fees: {
    eyebrow: string;
    heading: string;
    subheadline: string;
    talentShareLabel: string;
    clientFeeLabel: string;
    freelancerFeeLabel: string;
  };
  categories: {
    eyebrow: string;
    heading: string;
    subheadline: string;
  };
  caseStudies: {
    eyebrow: string;
    heading: string;
    subheadline: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    intro: string;
  };
}

export const YEKIS_COPY: Record<SupportedLang, LocalizedMarketingCopy> = {
  en: {
    nav: {
      overview: 'Overview',
      escrow: 'Escrow Vault',
      fees: 'Fees',
      categories: 'Departments',
      caseStudies: 'Case Studies',
      aboutFaq: 'About & FAQ',
      signIn: 'Sign in',
      getStarted: 'Get started',
    },
    hero: {
      eyebrow: 'ADDIS ABABA CORPORATE ESCROW HEADQUARTERS',
      titleLine1: 'FIND THE RIGHT',
      titleLine2: 'EXPERTISE.',
      subtitle:
        "Ethiopia's compliant freelance escrow workspace. Hire Fayda-verified professionals and lock project milestones safely in Telebirr, CBE Birr, or M-Pesa until delivery is approved.",
      slogan: 'Pay for results, not promises.',
      ctaPrimary: 'Post a Milestone Brief',
      ctaSecondary: 'Explore Escrow Vault',
      officeBadge: '3D Corporate Atrium · Bole Atlas, Addis Ababa',
    },
    stats: {
      eyebrow: 'CHAPTER 02 · INSTITUTIONAL TRUST & SCALE',
      heading: 'Built like an executive clearinghouse for Ethiopian digital work.',
      jobsLabel: 'Jobs completed',
      jobsDesc: 'Delivered across 40+ specialized corporate & digital categories',
      freelancersLabel: 'Verified freelancers',
      freelancersDesc: 'Fayda National ID & TIN verified professionals',
      escrowLabel: 'Secured in escrow (ETB)',
      escrowDesc: 'Ring-fenced milestone deposits across partner rails',
      payoutLabel: 'Avg. payout time',
      payoutDesc: 'From client milestone sign-off to local wallet',
    },
    escrow: {
      eyebrow: 'CHAPTER 03 · HOW ESCROW PROTECTS BOTH SIDES',
      heading: 'Pay for results, not promises.',
      subheadline:
        'Every contract operates inside a four-stage ring-fenced escrow workflow — eliminating upfront risk for companies and unpaid invoices for talent.',
      step1Title: 'Fund',
      step1Desc:
        'Deposit the agreed milestone budget into the Yekis Escrow Vault via Telebirr, CBE Birr, or bank transfer before work begins.',
      step2Title: 'Work',
      step2Desc:
        'The verified specialist completes the milestone and submits time-stamped deliverables, staging links, and handoff notes.',
      step3Title: 'Approve',
      step3Desc:
        'Inspect the delivery within 7 days. The moment you approve, funds release straight into the freelancer’s wallet.',
      step4Title: 'Protected',
      step4Desc:
        'If scope is disputed, our neutral Addis Ababa mediation desk reviews the audit trail and resolves within 48 hours.',
    },
    fees: {
      eyebrow: 'CHAPTER 04 · TRANSPARENT CORPORATE PRICING',
      heading: 'One small percentage. Only when work pays out.',
      subheadline:
        'Zero listing fees. Zero monthly retainers. A 5% total platform fee split evenly (2.5% client / 2.5% freelancer) with automated ERCA withholding tax compliance.',
      talentShareLabel: 'Goes to the freelancer',
      clientFeeLabel: 'Client escrow fee',
      freelancerFeeLabel: 'Freelancer service fee',
    },
    categories: {
      eyebrow: 'CHAPTER 05 · SIX SPECIALIZED STUDIO FLOORS',
      heading: 'Six corporate practice areas ready for deployment.',
      subheadline:
        'Browse vetted Ethiopian specialists across software engineering, brand architecture, performance marketing, editorial, localization, and data operations.',
    },
    caseStudies: {
      eyebrow: 'CHAPTER 06 · VERIFIED ENTERPRISE DELIVERIES',
      heading: 'Proven across Addis Ababa, Bahir Dar, Hawassa & Mekelle.',
      subheadline:
        'Inspect real multi-milestone ETB contracts and verified member reviews from Ethiopian founders, NGOs, and studios.',
    },
    about: {
      eyebrow: 'CHAPTER 07 · GOVERNANCE, FAYDA KYC & FAQ',
      heading: 'Great work deserves guaranteed payment.',
      intro:
        'Yekis bridges the trust gap in Ethiopian digital commerce by combining Fayda National ID verification, milestone escrow, and human mediation in one corporate-grade workspace.',
    },
  },
  am: {
    nav: {
      overview: 'አጠቃላይ',
      escrow: 'ኤስክሮው ካዝና',
      fees: 'ክፍሊቶች',
      categories: 'ዘርፎች',
      caseStudies: 'ተሞክሮዎች',
      aboutFaq: 'ስለ እኛ እና ጥያቄዎች',
      signIn: 'ይግቡ',
      getStarted: 'ይጀምሩ',
    },
    hero: {
      eyebrow: 'አዲስ አበባ · የኤስክሮው የስራ ማዕከል',
      titleLine1: 'ትክክለኛውን ባለሙያ',
      titleLine2: 'ያግኙ።',
      subtitle:
        'የኢትዮጵያ ታማኝ የፍሪላንስ እና የኤስክሮው የስራ መድረክ። በፋይዳ መታወቂያ የተረጋገጡ ባለሙያዎችን ይቅጠሩ፤ ስራው ተጠናቆ እስኪያጸድቁ ድረስ ክፍሊትዎ በቴሌብር ወይም በሲቢኢ ብር በኤስክሮው ይጠበቃል።',
      slogan: 'ለተስፋ ሳይሆን ለውጤት ይክፈሉ።',
      ctaPrimary: 'አዲስ ስራ ይለጥፉ',
      ctaSecondary: 'የኤስክሮው ሂደት ይመልከቱ',
      officeBadge: '3D ኮርፖሬት ቢሮ · ቦሌ አትላስ፣ አዲስ አበባ',
    },
    stats: {
      eyebrow: 'ምዕራፍ 02 · ተቋማዊ እምነት እና ውጤት',
      heading: 'ለኢትዮጵያ ዲጂታል ስራዎች የተገነባ ዘመናዊ የክፍሊት ማዕከል።',
      jobsLabel: 'የተጠናቀቁ ስራዎች',
      jobsDesc: 'በ40+ የሙያ ዘርፎች በስኬት የተረከቡ ፕሮጀክቶች',
      freelancersLabel: 'የተረጋገጡ ባለሙያዎች',
      freelancersDesc: 'በፋይዳ ብሔራዊ መታወቂያ እና TIN የተረጋገጡ',
      escrowLabel: 'በኤስክሮው የተጠበቀ (ETB)',
      escrowDesc: 'በአጋር ባንኮች የተጠበቀ የፕሮጀክት በጀት',
      payoutLabel: 'አማካይ የክፍሊት ጊዜ',
      payoutDesc: 'ስራው ከጸደቀበት ሰዓት ጀምሮ ወደ ቦርሳ የሚገባበት',
    },
    escrow: {
      eyebrow: 'ምዕራፍ 03 · ኤስክሮው እንዴት እንደሚጠብቅዎት',
      heading: 'ለተስፋ ሳይሆን ለውጤት ይክፈሉ።',
      subheadline:
        'እያንዳንዱ ክፍሊት አራት ግልጽ ደረጃዎችን ይከተላል — ለቀጣሪዎችም ሆነ ለባለሙያዎች ሙሉ ዋስትና ይሰጣል።',
      step1Title: 'ገንዘብ ማስያዝ (Fund)',
      step1Desc:
        'ስራ ከመጀመሩ በፊት የተስማሙበትን ክፍሊት በቴሌብር ወይም በሲቢኢ ብር ወደ ኤስክሮው ያስገባሉ።',
      step2Title: 'ስራ (Work)',
      step2Desc:
        'ባለሙያው የተሰጠውን ምዕራፍ (Milestone) አጠናቆ ፋይሎችንና ማስረጃዎችን ለግምገማ ያቀርባል።',
      step3Title: 'ማጽደቅ (Approve)',
      step3Desc:
        'በቀረበው ስራ ሲረኩ ያጸድቃሉ፤ ክፍሊቱም ወዲያውኑ ወደ ባለሙያው ቦርሳ ይለቀቃል።',
      step4Title: 'ጥበቃ እና ሽምግልና',
      step4Desc:
        'አለመግባባት ቢፈጠር የሽምግልና ቡድናችን ማስረጃዎችን መርምሮ በ48 ሰዓታት ውስጥ ፍትሃዊ ውሳኔ ይሰጣል።',
    },
    fees: {
      eyebrow: 'ምዕራፍ 04 · ግልጽ የአገልግሎት ክፍሊት',
      heading: 'አነስተኛ መቶኛ። ስራው ተጠናቆ ክፍሊት ሲፈጸም ብቻ።',
      subheadline:
        'ምንም የቅድሚያ ክፍያ የለም። የ5% የአገልግሎት ክፍያ በቀጣሪ (2.5%) እና በባለሙያ (2.5%) መካከል ይካፈላል።',
      talentShareLabel: 'ለባለሙያው የሚደርስ',
      clientFeeLabel: 'የቀጣሪ ክፍያ',
      freelancerFeeLabel: 'የባለሙያ ክፍያ',
    },
    categories: {
      eyebrow: 'ምዕራፍ 05 · ስድስት ዋና የሙያ ዘርፎች',
      heading: 'ለድርጅትዎ ዝግጁ የሆኑ ስድስት የሙያ ክፍሎች።',
      subheadline:
        'በሶፍትዌር ልማት፣ ዲዛይን፣ ዲጂታል ማርኬቲንግ፣ ይዘት ዝግጅት፣ ትርጉም እና ዳታ ትንተና የተረጋገጡ ባለሙያዎችን ያግኙ።',
    },
    caseStudies: {
      eyebrow: 'ምዕራፍ 06 · የተረጋገጡ የፕሮጀክት ውጤቶች',
      heading: 'በአዲስ አበባ፣ ባሕር ዳር፣ ሀዋሳ እና መቐለ የተመሰከረለት።',
      subheadline:
        'በዬኪስ የኤስክሮው ስርዓት የተጠናቀቁ ተጨባጭ ፕሮጀክቶችን እና የደንበኞችን ምስክርነት ይመልከቱ።',
    },
    about: {
      eyebrow: 'ምዕራፍ 07 · ስለ ዬኪስ እና ተደጋጋሚ ጥያቄዎች',
      heading: 'ጥሩ ስራ የተረጋገጠ ክፍሊት ይገባዋል።',
      intro:
        'ዬኪስ የኢትዮጵያ ኩባንያዎችን ከተረጋገጡ ባለሙያዎች ጋር ያገናኛል፤ እያንዳንዱን ክፍሊት ስራው ተረክቦ እስኪጸድቅ በኤስክሮው ይጠብቃል።',
    },
  },
  om: {
    nav: {
      overview: 'Waliigala',
      escrow: 'Kuusaa Escrow',
      fees: 'Kaffaltii',
      categories: 'Dameewwan',
      caseStudies: 'Muuxannoo',
      aboutFaq: 'Waa’ee & Gaaffii',
      signIn: 'Seeni',
      getStarted: 'Jalqabi',
    },
    hero: {
      eyebrow: 'FINFINNEE · WIIRTUU HOJII ESCROW KORPOREETII',
      titleLine1: 'OGEESSA SIRRII',
      titleLine2: 'ARGADHAA.',
      subtitle:
        'Waltajjii hojii bilisaa fi Escrow amanamaa Itoophiyaa. Ogeeyyii waraqaa eenyummaa Fayda tiin mirkanaa’an qacaradhaa; kaffaltiin keessan hanga hojiin mirkanaa’utti Telebirr fi CBE Birr keessatti eegama.',
      slogan: 'Abdii osoo hin taane, bu’aa hojiif kaffalaa.',
      ctaPrimary: 'Hojii Haaraa Maxxansaa',
      ctaSecondary: 'Sirna Escrow Ilaalaa',
      officeBadge: '3D Waajjira Muummichaa · Boolee Atlaas, Finfinnee',
    },
    stats: {
      eyebrow: 'BOQONNAA 02 · AMANTAA FI GUDDINA DHAABBATAA',
      heading: 'Hojii dijitaalaa Itoophiyaatiif wiirtuu kaffaltii ammayyaa.',
      jobsLabel: 'Hojiiwwan xumuraman',
      jobsDesc: 'Dameewwan ogummaa 40+ keessatti kan dhiyaatan',
      freelancersLabel: 'Ogeeyyii mirkanaa’an',
      freelancersDesc: 'Eenyummaa Fayda fi TIN kan mirkanaa’e',
      escrowLabel: 'Escrow keessatti kan eegame (ETB)',
      escrowDesc: 'Kaffaltii maamiltootaa nageenyaan qabame',
      payoutLabel: 'Yeroo kaffaltii giddugaleessaa',
      payoutDesc: 'Erga hojiin mirkanaa’ee gara boorsaatti',
    },
    escrow: {
      eyebrow: 'BOQONNAA 03 · ESCROW AKKAMIIN ISIN EEGA',
      heading: 'Abdii osoo hin taane, bu’aa hojiif kaffalaa.',
      subheadline:
        'Kaffaltiin hundi tarkaanfii ifaa afur hordofa — maamiltootaa fi ogeeyyiif wabii guutuu kenna.',
      step1Title: 'Kuusuu (Fund)',
      step1Desc:
        'Hojiin dura maallaqa waliigalame Telebirr ykn CBE Birr fayyadamuun Escrow keessa kaa’u.',
      step2Title: 'Hojjechuu (Work)',
      step2Desc:
        'Ogeessi marsaa hojii xumuruun galmeewwan fi ibsa gamaaggamaaf dhiyeessa.',
      step3Title: 'Mirkaneessuu (Approve)',
      step3Desc:
        'Hojiitti yoo quuftan ni mirkaneessitu; maallaqnis battalumatti gara boorsaa ogeessaatti darba.',
      step4Title: 'Eegumsa & Araara',
      step4Desc:
        'Wal-dhabdeen yoo uumame gareen araaraa ragaa qoratee sa’aatii 48 keessatti furmaata haqa-qabeessa kenna.',
    },
    fees: {
      eyebrow: 'BOQONNAA 04 · KAFFALTII IFAA',
      heading: 'Dhibbeentaa xiqqoo. Yeroo hojiin kaffalamu qofa.',
      subheadline:
        'Kaffaltiin duraa hin jiru. Kaffaltiin waltajjii 5% maamilaa (2.5%) fi ogeessa (2.5%) gidduutti qoodama.',
      talentShareLabel: 'Ogeessaaf kan ga’u',
      clientFeeLabel: 'Kaffaltii maamilaa',
      freelancerFeeLabel: 'Kaffaltii ogeessaa',
    },
    categories: {
      eyebrow: 'BOQONNAA 05 · KUTAAWWAN OGUMMAA JA’A',
      heading: 'Dameewwan ogummaa gurguddoo ja’a.',
      subheadline:
        'Ijaarsa sooftiweerii, dizaayinii, gabaa dijitaalaa, qophii qabiyyee, hiikkaa afaanii fi qorannoo daataa.',
    },
    caseStudies: {
      eyebrow: 'BOQONNAA 06 · BU’AAWWAN HOJII MIRKANAA’AN',
      heading: 'Finfinnee, Baahir Daar, Hawaasaa fi Maqalee keessatti kan mirkanaa’e.',
      subheadline:
        'Pirojektoota ETB dhugaa fi yaada miseensota keenyaa qoradhaa.',
    },
    about: {
      eyebrow: 'BOQONNAA 07 · WAA’EE YEKIS FI GAAFFILEE',
      heading: 'Hojiin gaariin kaffaltii wabii qabu mala.',
      intro:
        'Yekis dhaabbilee Itoophiyaa ogeeyyii mirkanaa’an waliin wal-qunnamsiisa; kaffaltii hundas hanga hojiin mirkanaa’utti Escrow keessatti eega.',
    },
  },
  ti: {
    nav: {
      overview: 'ሓፈሻዊ',
      escrow: 'ኤስክሮው ካዝና',
      fees: 'ክፍሊታት',
      categories: 'ዓውድታት',
      caseStudies: 'ተሞክሮታት',
      aboutFaq: 'ብዛዕባናን ሕቶታትን',
      signIn: 'እተዉ',
      getStarted: 'ጀምሩ',
    },
    hero: {
      eyebrow: 'ኣዲስ ኣበባ · ማእከል ስራሕን ኤስክሮውን ዬኪስ',
      titleLine1: 'ዝተረጋገጸ ክኢላ',
      titleLine2: 'ርኸቡ።',
      subtitle:
        'ናይ ኢትዮጵያ እሙን ናይ ፍሪላንስን ኤስክሮውን መድረኽ። ብፋይዳ መንነት ዝተረጋገጹ ሰብሞያ ቆጽሩ፤ ስራሕ ተዛዚሙ ክሳብ ተጽድቑ ክፍሊትኩም ብቴሌብር ወይ ሲቢኢ ብር ይሕሎ።',
      slogan: 'ንተስፋ ዘይኮነስ ንውጽኢት ክፈሉ።',
      ctaPrimary: 'ሓድሽ ስራሕ ለጥፉ',
      ctaSecondary: 'ስርዓት ኤስክሮው ርኣዩ',
      officeBadge: '3D ኮርፖሬት ቤት ጽሕፈት · ቦሌ ኣትላስ፣ ኣዲስ ኣበባ',
    },
    stats: {
      eyebrow: 'ምዕራፍ 02 · ትካላዊ እምነትን ዕቤትን',
      heading: 'ንዲጂታል ስራሕቲ ኢትዮጵያ ዝተሃንጸ ዘመናዊ ማእከል ክፍሊት።',
      jobsLabel: 'ዝተዛዘሙ ስራሕቲ',
      jobsDesc: 'ኣብ ልዕሊ 40+ ዓውድታት ስራሕ ብዓወት ዝተረከቡ',
      freelancersLabel: 'ዝተረጋገጹ ሰብሞያ',
      freelancersDesc: 'ብፋይዳ ብሄራዊ መንነትን TINን ዝተረጋገጹ',
      escrowLabel: 'ኣብ ኤስክሮው ዝተዓቀበ (ETB)',
      escrowDesc: 'ውሕስነት ዘለዎም ናይ ፕሮጀክት ክፍሊታት',
      payoutLabel: 'ማእኸላይ ግዜ ክፍሊት',
      payoutDesc: 'ካብ ምጽዳቕ ክሳብ ናብ ቦርሳ ዝኣትወሉ ግዜ',
    },
    escrow: {
      eyebrow: 'ምዕራፍ 03 · ኤስክሮው ብኸመይ ይሕልወኩም',
      heading: 'ንተስፋ ዘይኮነስ ንውጽኢት ክፈሉ።',
      subheadline:
        'ነፍሲ ወከፍ ክፍሊት ኣርባዕተ ግሉጽ ደረጃታት ይኽተል — ንዓማዊልን ንሰብሞያን ምሉእ ውሕስነት ይህብ።',
      step1Title: 'ምትሓዝ (Fund)',
      step1Desc:
        'ስራሕ ቅድሚ ምጅማሩ ዝተሰማማዕኩምሉ ገንዘብ ብቴሌብር ወይ ሲቢኢ ብር ኣብ ኤስክሮው ተቐምጡ።',
      step2Title: 'ስራሕ (Work)',
      step2Desc:
        'እቲ በዓል ሞያ ነቲ ብርኪ ዕዮ ወዲኡ ፋይላትን መግለጽን ንግምገማ የቕርብ።',
      step3Title: 'ምጽዳቕ (Approve)',
      step3Desc:
        'በቲ ዝቐረበ ስራሕ ምስ ዓገብኩም ተጽድቕዎ፤ እቲ ገንዘብ ድማ ብኡንብኡ ይልቀቕ።',
      step4Title: 'ውሕስነትን ሽምግልናን',
      step4Desc:
        'ዘይምርድዳእ እንተተፈጢሩ ጋንታ ሽምግልናና መርትዖ መርሚሩ ኣብ ውሽጢ 48 ሰዓታት ፍትሓዊ ውሳነ ይህብ።',
    },
    fees: {
      eyebrow: 'ምዕራፍ 04 · ግሉጽ ክፍሊት ኣገልግሎት',
      heading: 'ንእሽቶ ሚኢታዊት። ስራሕ ተዛዚሙ ክፍሊት ክፍጸም ከሎ ጥራይ።',
      subheadline:
        'ቅድመ ክፍሊት የለን። 5% ክፍሊት ኣገልግሎት ኣብ መንጎ ዓሚል (2.5%)ን በዓል ሞያ (2.5%)ን ይምቀል።',
      talentShareLabel: 'ንበዓል ሞያ ዝበጽሕ',
      clientFeeLabel: 'ክፍሊት ዓሚል',
      freelancerFeeLabel: 'ክፍሊት በዓል ሞያ',
    },
    categories: {
      eyebrow: 'ምዕራፍ 05 · ሽዱሽተ ቀንዲ ዓውድታት ሞያ',
      heading: 'ንትካልኩም ድሉዋት ዝኾኑ ሽዱሽተ ክፍልታት ሞያ።',
      subheadline:
        'ኣብ ምድላው ሶፍትዌር፣ ዲዛይን፣ ዲጂታል ማርኬቲንግ፣ ትሕዝቶ፣ ትርጉምን ዳታን ዝተረጋገጹ ክኢላታት ርኸቡ።',
    },
    caseStudies: {
      eyebrow: 'ምዕራፍ 06 · ዝተረጋገጹ ውጽኢታት ፕሮጀክት',
      heading: 'ኣብ ኣዲስ ኣበባ፣ ባህር ዳር፣ ሀዋሳን መቐለን ዝተመስከረሉ።',
      subheadline:
        'ብናይ ዬኪስ ኤስክሮው ዝተዛዘሙ ፕሮጀክትታትን ምስክርነት ኣባላትን ተመልከቱ።',
    },
    about: {
      eyebrow: 'ምዕራፍ 07 · ብዛዕባ ዬኪስን ተደጋጋሚ ሕቶታትን',
      heading: 'ጽቡቕ ስራሕ ውሑስ ክፍሊት ይግብኦ።',
      intro:
        'ዬኪስ ትካላት ኢትዮጵያ ምስ ዝተረጋገጹ ሰብሞያ የራኽብ፤ ነፍሲ ወከፍ ክፍሊት ድማ ስራሕ ክሳብ ዝጸድቕ ኣብ ኤስክሮው ይሕሎ።',
    },
  },
};

export interface DepartmentCategory {
  id: string;
  code: string;
  floorLabel: string;
  titleLine1: string;
  titleLine2: string;
  openRoles: number;
  tags: string[];
  avgMilestoneEtb: string;
  leadTime: string;
  summary: string;
}

export const YEKIS_DEPARTMENTS: ReadonlyArray<DepartmentCategory> = [
  {
    id: 'WEB_APP_DEVELOPMENT',
    code: '01 / ENGINEERING',
    floorLabel: 'Floor 06 · Software & Systems Studio',
    titleLine1: 'Web & Mobile App',
    titleLine2: 'Development',
    openRoles: 148,
    tags: ['Full-Stack React/Node', 'Flutter & iOS', 'Telebirr / CBE APIs'],
    avgMilestoneEtb: '35,000 – 120,000 ETB',
    leadTime: '1–4 Weeks per Milestone',
    summary:
      'Production web platforms, Telegram Mini Apps, ERP dashboards, and local payment gateway integrations built by senior Ethiopian engineers.',
  },
  {
    id: 'GRAPHIC_DESIGN',
    code: '02 / BRAND ARCHITECTURE',
    floorLabel: 'Floor 05 · Identity & Packaging Atelier',
    titleLine1: 'Graphic Design',
    titleLine2: '& Corporate Branding',
    openRoles: 96,
    tags: ['Brand Systems', 'Export Packaging', 'UI/UX Figma Systems'],
    avgMilestoneEtb: '15,000 – 60,000 ETB',
    leadTime: '4–10 Days per Milestone',
    summary:
      'Bilingual Amharic/English visual identities, coffee & FMCG export packaging dielines, investor decks, and interactive product design.',
  },
  {
    id: 'DIGITAL_MARKETING',
    code: '03 / GROWTH & PERFORMANCE',
    floorLabel: 'Floor 04 · Performance & Media Desk',
    titleLine1: 'Digital',
    titleLine2: 'Marketing',
    openRoles: 74,
    tags: ['Telegram Funnels', 'TikTok & Meta Ads', 'Search & Analytics'],
    avgMilestoneEtb: '12,000 – 45,000 ETB',
    leadTime: '1–2 Weeks per Sprint',
    summary:
      'High-conversion Telegram channel ecosystems, short-form commercial production, and measurable ROAS acquisition campaigns.',
  },
  {
    id: 'CONTENT_WRITING',
    code: '04 / EDITORIAL & STRATEGY',
    floorLabel: 'Floor 03 · Editorial & Technical Press',
    titleLine1: 'Content &',
    titleLine2: 'Copywriting',
    openRoles: 61,
    tags: ['Grant Proposals', 'UX Microcopy', 'Corporate Reports'],
    avgMilestoneEtb: '8,000 – 30,000 ETB',
    leadTime: '3–7 Days per Milestone',
    summary:
      'Executive annual reports, NGO grant documentation, technical API guides, and conversion copywriting tailored for East African markets.',
  },
  {
    id: 'TRANSLATION',
    code: '05 / MULTILINGUAL LOCALIZATION',
    floorLabel: 'Floor 02 · Linguistic & Clinical QA Suite',
    titleLine1: 'Amharic / Oromiffa /',
    titleLine2: 'Tigrigna Localization',
    openRoles: 53,
    tags: ['Amharic · አማርኛ', 'Afaan Oromoo', 'Tigrigna · ትግርኛ'],
    avgMilestoneEtb: '10,000 – 40,000 ETB',
    leadTime: '2–6 Days per Tranche',
    summary:
      'Certified legal, medical, fintech UI, and voiceover localization across Ethiopia’s primary languages with native terminology QA.',
  },
  {
    id: 'DATA_ENTRY',
    code: '06 / DATA & AI OPERATIONS',
    floorLabel: 'Floor 01 · Enterprise Data & ETL Operations',
    titleLine1: 'Data Processing',
    titleLine2: '& BI Engineering',
    openRoles: 88,
    tags: ['Financial Reconciliation', 'Geospatial QA', 'AI Corpus Annotation'],
    avgMilestoneEtb: '10,000 – 50,000 ETB',
    leadTime: '3–10 Days per Batch',
    summary:
      'Structured ledger digitization, logistics telemetry cleanup, Ge’ez script dataset annotation, and automated BI reporting pipelines.',
  },
];

export interface CaseStudyRecord {
  id: string;
  category: string;
  title: string;
  client: string;
  city: string;
  budgetEtb: string;
  timeline: string;
  rail: string;
  outcomeMetric: string;
  summary: string;
  quote: string;
  quoteAuthor: string;
  milestones: ReadonlyArray<{ title: string; amount: string; duration: string }>;
}

export const YEKIS_CASE_STUDIES: ReadonlyArray<CaseStudyRecord> = [
  {
    id: 'cs-abyssinia-logistics',
    category: 'ENGINEERING',
    title: 'Real-Time Fleet Dispatch & Telebirr Driver Settlement Portal',
    client: 'Abyssinia Heavy Freight PLC',
    city: 'Addis Ababa · Bahir Dar',
    budgetEtb: '85,000 ETB',
    timeline: '3 Weeks',
    rail: 'Telebirr & CBE Birr',
    outcomeMetric: '-68% dispatch reconciliation time',
    summary:
      'Replaced manual spreadsheet reconciliation across 140+ long-haul trucks along the Addis–Djibouti and Bahir Dar corridors with a milestone-escrowed web dashboard.',
    quote:
      'Approving each milestone released payment immediately. Our lead developer in Bahir Dar delivered every sprint ahead of schedule with zero payment friction.',
    quoteAuthor: 'Yared K., Operations Director · Addis Ababa',
    milestones: [
      { title: '01 · System Architecture & API Schema', amount: '15,000 ETB', duration: '4 days' },
      { title: '02 · Dispatcher Web Dashboard & Live Map', amount: '30,000 ETB', duration: '7 days' },
      { title: '03 · Driver Mobile Check-In & Telebirr Webhook', amount: '25,000 ETB', duration: '6 days' },
      { title: '04 · Load Testing, QA & Production Handover', amount: '15,000 ETB', duration: '4 days' },
    ],
  },
  {
    id: 'cs-kaffa-coffee',
    category: 'BRAND ARCHITECTURE',
    title: 'Kaffa Origin Specialty Coffee Export Identity & Packaging System',
    client: 'Kaffa Highland Exporters Union',
    city: 'Hawassa',
    budgetEtb: '45,000 ETB',
    timeline: '2 Weeks',
    rail: 'CBE Birr',
    outcomeMetric: '3 international buyer contracts signed',
    summary:
      'Complete brand identity, bilingual export packaging dielines, and a wholesale buyer lookbook for specialty washed Arabica lots shipping to European roasters.',
    quote:
      'Escrow gave our union board confidence to hire a top Addis studio remotely. We reviewed print-ready proofs inside Yekis before releasing each tranche.',
    quoteAuthor: 'Meron G., Export Marketing Lead · Hawassa',
    milestones: [
      { title: '01 · Brand Strategy, Wordmark & Color System', amount: '15,000 ETB', duration: '5 days' },
      { title: '02 · 250g & 1kg Export Bag Print Dielines', amount: '18,000 ETB', duration: '5 days' },
      { title: '03 · Digital Buyer Deck & Brand Guidelines', amount: '12,000 ETB', duration: '4 days' },
    ],
  },
  {
    id: 'cs-zemen-localization',
    category: 'LOCALIZATION',
    title: 'Multilingual Maternal Health App Localization (Amharic, Afaan Oromoo & Tigrigna)',
    client: 'Biruh Health Initiative NGO',
    city: 'Bahir Dar',
    budgetEtb: '38,000 ETB',
    timeline: '10 Days',
    rail: 'Telebirr',
    outcomeMetric: '180 modules localized with 100% clinical QA',
    summary:
      'Medical-grade translation, voiceover recording, and cultural QA of 180+ maternal nutrition modules across Amharic, Afaan Oromoo, and Tigrigna.',
    quote:
      'Hiring three certified linguists through Yekis with TIN-compliant receipts saved our finance team weeks of grant auditing paperwork.',
    quoteAuthor: 'Dr. Sara M., Program Coordinator · Bahir Dar',
    milestones: [
      { title: '01 · Medical Glossary & Terminology Alignment', amount: '8,000 ETB', duration: '2 days' },
      { title: '02 · UI Strings & Lesson Script Translation', amount: '18,000 ETB', duration: '5 days' },
      { title: '03 · Native Audio Prompts & In-App Linguistic QA', amount: '12,000 ETB', duration: '3 days' },
    ],
  },
];

export const YEKIS_REVIEWS = [
  {
    name: 'Abel T.',
    role: 'Full-Stack Developer · Bahir Dar',
    source: 'Google',
    rating: 5,
    quote:
      'As a freelancer in Bahir Dar, getting paid used to be the hardest part. Now funds land in my wallet the moment the client approves.',
  },
  {
    name: 'Meron G.',
    role: 'Brand Designer · Addis Ababa',
    source: 'Trustpilot',
    rating: 5,
    quote:
      'Escrow on every contract means I never chase invoices again. The payout to my local bank is quicker than my old platform ever managed.',
  },
  {
    name: 'Hanna L.',
    role: 'Startup Founder · Addis Ababa',
    source: 'Trustpilot',
    rating: 5,
    quote:
      'We hired three developers through YEKIS last quarter. Approving a milestone releases payment instantly; our contractors stopped asking about delays.',
  },
  {
    name: 'Betty A.',
    role: 'Studio Owner · Mekelle',
    source: 'Trustpilot',
    rating: 5,
    quote:
      'Onboarding my studio took one afternoon. Contracts, escrow and payouts in one place — my accountant is happier too.',
  },
] as const;

export const YEKIS_FAQ_ITEMS: ReadonlyArray<FaqItemData> = [
  {
    id: 'faq-escrow-1',
    category: 'escrow',
    question: 'How does Yekis milestone escrow protect both clients and freelancers?',
    answer:
      'Before work begins, the client funds the agreed milestone in ETB via Telebirr, CBE Birr, M-Pesa, or bank transfer. Yekis locks the funds in a ring-fenced escrow account. The freelancer sees verified proof of funds before starting, and the client only releases payment once deliverables are inspected and approved (or after the 7-day auto-review window).',
  },
  {
    id: 'faq-kyc-1',
    category: 'kyc',
    question: 'Why does Yekis require Fayda National ID and TIN verification?',
    answer:
      'Every Ethiopian freelancer on Yekis completes Fayda National ID OTP verification to eliminate anonymous fraud. Adding a verified Ethiopian TIN reduces statutory ERCA withholding tax on eligible B2B service contracts (>= 10,000 ETB) from 30% down to 3%.',
  },
  {
    id: 'faq-payouts-1',
    category: 'payouts',
    question: 'What are the exact platform fees and how fast are Telebirr / CBE Birr payouts?',
    answer:
      'Posting a job or creating a freelancer profile is 0 ETB. When a milestone is approved and released, Yekis charges a 5% total platform fee split evenly: 2.5% from the client deposit and 2.5% from the freelancer payout—meaning freelancers keep 97.5% of their gross milestone before applicable tax. Approved payouts settle in 6.5 hours on average.',
  },
  {
    id: 'faq-disputes-1',
    category: 'disputes',
    question: 'What happens if deliverables do not match the agreed milestone scope?',
    answer:
      'Within the 7-day review window, either party can trigger a structured dispute. Our neutral Addis Ababa mediation desk locks the escrow balance, compiles the time-stamped workspace chat and file deliverables, and issues an evidence-backed resolution within 48 hours.',
  },
  {
    id: 'faq-escrow-2',
    category: 'escrow',
    question: 'Can enterprise teams split large contracts into multiple sequential milestones?',
    answer:
      'Yes. Corporate clients routinely divide projects into 3 to 6 sequential milestones (such as Architecture, UI Prototype, Backend Integration, and QA Handover). You can fund all milestones upfront or fund each tranche sequentially as prior deliverables are signed off.',
  },
];
