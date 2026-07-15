export type Locale = "en" | "he";

type LandingCopy = {
  languageName: string;
  direction: "ltr" | "rtl";
  nav: {
    features: string;
    access: string;
    login: string;
  };
  eyebrow: string;
  title: string;
  introduction: string;
  primaryAction: string;
  secondaryAction: string;
  previewLabel: string;
  previewDate: string;
  previewRows: ReadonlyArray<{ label: string; time: string }>;
  featuresHeading: string;
  featuresIntroduction: string;
  features: ReadonlyArray<{
    number: string;
    title: string;
    description: string;
  }>;
  accessHeading: string;
  accessDescription: string;
  registerAction: string;
  signInAction: string;
  footer: string;
};

export const landingCopy: Record<Locale, LandingCopy> = {
  en: {
    languageName: "עברית",
    direction: "ltr",
    nav: {
      features: "What it does",
      access: "For your synagogue",
      login: "Sign in",
    },
    eyebrow: "Synagogue time, made visible",
    title: "The right time. The right prayer. On every screen.",
    introduction:
      "MenEZmanim keeps wall displays, minyan schedules, Jewish calendar details, and community notices together in one dependable system.",
    primaryAction: "Set up your synagogue",
    secondaryAction: "Sign in",
    previewLabel: "Live board",
    previewDate: "Wednesday · 29 Tammuz",
    previewRows: [
      { label: "Sunrise · הנץ החמה", time: "5:43" },
      { label: "Latest Shema · סוף זמן שמע", time: "9:14" },
      { label: "Sunset · שקיעה", time: "7:47" },
    ],
    featuresHeading: "Built around the daily rhythm of a shul",
    featuresIntroduction:
      "From accurate zmanim to the last announcement before Maariv, each part has one clear place.",
    features: [
      {
        number: "01",
        title: "Live zmanim boards",
        description:
          "Full-screen, bilingual displays keep halachic times and calendar details visible throughout the day.",
      },
      {
        number: "02",
        title: "A true visual editor",
        description:
          "Arrange live widgets on the board you are editing, with styles made for large synagogue screens.",
      },
      {
        number: "03",
        title: "Minyan schedules",
        description:
          "Manage fixed and zman-based minyanim, groups, rooms, visibility rules, and seasonal changes.",
      },
      {
        number: "04",
        title: "Community content",
        description:
          "Publish announcements, yahrzeits, sponsors, daily notes, flyers, and other shared information.",
      },
      {
        number: "05",
        title: "Mobile access",
        description:
          "Give congregants a focused phone view of today’s zmanim, minyanim, calendar, and notices.",
      },
      {
        number: "06",
        title: "Every screen managed",
        description:
          "Run several boards and styles for one synagogue without losing track of what each screen shows.",
      },
    ],
    accessHeading: "Give your community one reliable place to look.",
    accessDescription:
      "Create an organization for your synagogue, invite the people who maintain it, and build the first board together.",
    registerAction: "Create an account",
    signInAction: "I already have an account",
    footer: "MenEZmanim · Synagogue display and scheduling",
  },
  he: {
    languageName: "English",
    direction: "rtl",
    nav: {
      features: "מה המערכת עושה",
      access: "לבית הכנסת שלכם",
      login: "כניסה",
    },
    eyebrow: "זמני בית הכנסת מול העיניים",
    title: "הזמן הנכון. התפילה הנכונה. בכל מסך.",
    introduction:
      "מנאיזמנים מרכזת לוחות תצוגה, זמני תפילה, מידע מהלוח העברי והודעות לקהילה במערכת אחת אמינה.",
    primaryAction: "הקמת בית כנסת",
    secondaryAction: "כניסה",
    previewLabel: "לוח חי",
    previewDate: "יום רביעי · כ״ט בתמוז",
    previewRows: [
      { label: "הנץ החמה · Sunrise", time: "5:43" },
      { label: "סוף זמן שמע · Latest Shema", time: "9:14" },
      { label: "שקיעה · Sunset", time: "7:47" },
    ],
    featuresHeading: "נבנתה סביב סדר היום של בית הכנסת",
    featuresIntroduction:
      "מזמנים מדויקים ועד ההודעה האחרונה לפני ערבית, לכל פרט יש מקום ברור.",
    features: [
      {
        number: "01",
        title: "לוחות זמנים חיים",
        description:
          "תצוגות דו־לשוניות במסך מלא מציגות זמני הלכה ומידע מהלוח העברי לאורך היום.",
      },
      {
        number: "02",
        title: "עורך חזותי אמיתי",
        description:
          "מסדרים רכיבים חיים ישירות על הלוח הנערך, עם סגנונות המותאמים למסכים גדולים.",
      },
      {
        number: "03",
        title: "זמני תפילה",
        description:
          "מנהלים מניינים קבועים ודינמיים, קבוצות, חדרים, כללי תצוגה ושינויים עונתיים.",
      },
      {
        number: "04",
        title: "תוכן קהילתי",
        description:
          "מפרסמים הודעות, יארצייטים, נותני חסות, הערות יומיות, מודעות ומידע משותף.",
      },
      {
        number: "05",
        title: "גישה מהנייד",
        description:
          "נותנים למתפללים תצוגה ברורה של זמני היום, מניינים, לוח והודעות בטלפון.",
      },
      {
        number: "06",
        title: "ניהול כל המסכים",
        description:
          "מפעילים כמה לוחות וסגנונות לבית כנסת אחד ויודעים תמיד מה מוצג בכל מסך.",
      },
    ],
    accessHeading: "מקום אחד ואמין שהקהילה יודעת לבדוק.",
    accessDescription:
      "פותחים ארגון לבית הכנסת, מזמינים את האנשים שמנהלים אותו ובונים יחד את הלוח הראשון.",
    registerAction: "פתיחת חשבון",
    signInAction: "כבר יש לי חשבון",
    footer: "מנאיזמנים · תצוגה וניהול זמנים לבית הכנסת",
  },
};
