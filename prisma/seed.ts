import { PrismaClient, PromptType } from '@prisma/client';
import { generateSlug } from '../src/lib/utils';

const prisma = new PrismaClient();

const tools = [
  {
    nameEn: 'ChatGPT',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  },
  {
    nameEn: 'Claude.ai',
    iconUrl: 'https://claude.ai/favicon.ico',
  },
  {
    nameEn: 'Replit',
    iconUrl: 'https://replit.com/public/icons/favicon-196.png',
  },
  {
    nameEn: 'Gemini',
    iconUrl: 'https://www.gstatic.com/lamda/images/favicon_v1_150160c4f777e09d790c.svg',
  },
  {
    nameEn: 'DeepSeek',
    iconUrl: 'https://www.deepseek.com/favicon.ico',
  },
  {
    nameEn: 'MidJourney',
    iconUrl: 'https://www.midjourney.com/favicon.ico',
  },
  {
    nameEn: 'Cursor AI',
    iconUrl: 'https://cursor.sh/favicon.ico',
  },
  {
    nameEn: 'WindSurf',
    iconUrl: 'https://www.codeium.com/favicon.ico',
  },
];

const categories = [
  {
    nameEn: 'Business Hub',
    nameAr: 'مركز الأعمال',
    order: 1,
    subcategories: [
      { nameEn: 'Entrepreneurship', nameAr: 'ريادة الأعمال' },
      { nameEn: 'Strategy', nameAr: 'استراتيجية' },
      { nameEn: 'Leadership', nameAr: 'قيادة' },
      { nameEn: 'Productivity', nameAr: 'إنتاجية' },
      { nameEn: 'Funding', nameAr: 'تمويل' },
      { nameEn: 'Finance', nameAr: 'مالية' },
      { nameEn: 'Marketing', nameAr: 'تسويق' },
      { nameEn: 'Legal', nameAr: 'قانون' },
    ],
  },
  {
    nameEn: 'Tech & Code',
    nameAr: 'التقنية والبرمجة',
    order: 2,
    subcategories: [
      { nameEn: 'Coding', nameAr: 'برمجة' },
      { nameEn: 'Web & Apps', nameAr: 'ويب وتطبيقات' },
      { nameEn: 'Automation', nameAr: 'أتمتة' },
      { nameEn: 'Cybersecurity', nameAr: 'أمن سيبراني' },
      { nameEn: 'Data', nameAr: 'بيانات' },
      { nameEn: 'AI', nameAr: 'ذكاء اصطناعي' },
      { nameEn: 'Robotics', nameAr: 'روبوتات' },
    ],
  },
  {
    nameEn: 'Research & Engineering',
    nameAr: 'البحث والهندسة',
    order: 3,
    subcategories: [
      { nameEn: 'Research', nameAr: 'بحث' },
      { nameEn: 'Engineering', nameAr: 'هندسة' },
      { nameEn: 'Biotech', nameAr: 'تكنولوجيا حيوية' },
      { nameEn: 'Space', nameAr: 'فضاء' },
    ],
  },
  {
    nameEn: 'Industry',
    nameAr: 'الصناعة',
    order: 4,
    subcategories: [
      { nameEn: 'Healthcare', nameAr: 'رعاية صحية' },
      { nameEn: 'Real Estate', nameAr: 'عقارات' },
      { nameEn: 'Environment', nameAr: 'بيئة' },
      { nameEn: 'Non-Profit', nameAr: 'غير ربحي' },
      { nameEn: 'Manufacturing', nameAr: 'تصنيع' },
      { nameEn: 'Agriculture', nameAr: 'زراعة' },
    ],
  },
  {
    nameEn: 'Creative',
    nameAr: 'إبداع',
    order: 5,
    subcategories: [
      { nameEn: 'Writing', nameAr: 'كتابة' },
      { nameEn: 'Blogging', nameAr: 'مدونات' },
      { nameEn: 'Graphic', nameAr: 'تصميم جرافيكي' },
      { nameEn: 'UI/UX', nameAr: 'تصميم واجهات' },
      { nameEn: 'Film', nameAr: 'أفلام' },
      { nameEn: 'Music', nameAr: 'موسيقى' },
      { nameEn: 'Animation', nameAr: 'رسوم متحركة' },
    ],
  },
  {
    nameEn: 'Lifestyle',
    nameAr: 'نمط الحياة',
    order: 6,
    subcategories: [
      { nameEn: 'Mindfulness', nameAr: 'يقظة' },
      { nameEn: 'Fitness', nameAr: 'لياقة' },
      { nameEn: 'Travel', nameAr: 'سفر' },
      { nameEn: 'Food', nameAr: 'طعام' },
      { nameEn: 'Fashion', nameAr: 'موضة' },
      { nameEn: 'DIY', nameAr: 'اصنعها بنفسك' },
      { nameEn: 'Gaming', nameAr: 'ألعاب' },
    ],
  },
  {
    nameEn: 'Skills',
    nameAr: 'مهارات',
    order: 7,
    subcategories: [
      { nameEn: 'Languages', nameAr: 'لغات' },
      { nameEn: 'Tutoring', nameAr: 'دروس' },
      { nameEn: 'Career', nameAr: 'مهنة' },
      { nameEn: 'Courses', nameAr: 'دورات' },
    ],
  },
  {
    nameEn: 'Civic',
    nameAr: 'مواطنة',
    order: 8,
    subcategories: [
      { nameEn: 'Policy', nameAr: 'سياسات' },
      { nameEn: 'Community', nameAr: 'مجتمع' },
      { nameEn: 'Regulation', nameAr: 'تنظيم' },
    ],
  },
];

const prompts = [
  {
    titleEn: 'Business Model Strategy',
    titleAr: 'استراتيجية نموذج العمل',
    descriptionEn: 'Develop a comprehensive business model canvas that delivers strategic insights for startups. Ideal for entrepreneurs seeking clarity and depth.',
    descriptionAr: 'طور نموذج عمل تجاري شامل يقدم رؤى استراتيجية للشركات الناشئة. مثالي لرواد الأعمال الباحثين عن الوضوح والعمق.',
    instructionsEn: 'I want you to act as an expert in business model development and entrepreneurship. Your task is to create a comprehensive business model canvas using the following inputs: [Business Name, Target Audience, Business Description]. Ensure your analysis covers Key Partners, Key Activities, Value Proposition, Customer Relationships, Customer Segments, Key Resources, Channels, Cost Structure, and Revenue Streams. Provide a detailed and thorough output.',
    instructionsAr: 'أريدك أن تتصرف كخبير في تطوير نماذج الأعمال وريادة الأعمال. مهمتك هي إنشاء نموذج عمل شامل باستخدام المدخلات التالية: [اسم العمل، الجمهور المستهدف، وصف العمل]. تأكد من أن تحليلك يغطي الشركاء الرئيسيين، الأنشطة الرئيسية، عرض القيمة، علاقات العملاء، شرائح العملاء، الموارد الرئيسية، القنوات، هيكل التكلفة، وتدفقات الإيرادات. قدم مخرجات مفصلة وشاملة.',
    type: PromptType.Pro,
    usesCounter: 0,
    categoryName: 'Business Hub',
    subcategories: ['Entrepreneurship', 'Strategy'],
    tools: ['ChatGPT', 'Gemini', 'Claude.ai', 'DeepSeek']
  },
  {
    titleEn: 'Professional Narrative Construction',
    titleAr: 'إنشاء السرد الاحترافي',
    descriptionEn: 'Produce a refined narrative that articulates brand identity with clarity and persuasive impact. Ideal for advanced marketing communications.',
    descriptionAr: 'أنشئ سرداً مصقولاً يعبر عن هوية العلامة التجارية بوضوح وتأثير إقناعي. مثالي للاتصالات التسويقية المتقدمة.',
    instructionsEn: 'I want you to act as a professional copywriter and narrative expert. Your task is to craft a compelling narrative that clearly communicates the core identity of a brand. Use structured and vivid language to delineate the brand\'s journey, core values, and vision. [Insert brand details].',
    instructionsAr: 'أريدك أن تتصرف ككاتب محترف وخبير في السرد. مهمتك هي إنشاء سرد مقنع يعبر بوضوح عن الهوية الأساسية للعلامة التجارية. استخدم لغة منظمة وواضحة لتحديد رحلة العلامة التجارية، القيم الأساسية، والرؤية. [أدخل تفاصيل العلامة التجارية].',
    type: PromptType.Free,
    usesCounter: 0,
    categoryName: 'Creative',
    subcategories: ['Writing'],
    tools: ['ChatGPT', 'Gemini', 'Claude.ai', 'DeepSeek']
  },
  {
    titleEn: 'Marketing Strategy Formulation',
    titleAr: 'صياغة استراتيجية التسويق',
    descriptionEn: 'Craft a strategic marketing plan that drives growth and delivers measurable results. Essential for organizations targeting market leadership.',
    descriptionAr: 'صغ خطة تسويقية استراتيجية تعزز النمو وتحقق نتائج قابلة للقياس. ضرورية للمنظمات التي تطمح للريادة في السوق.',
    instructionsEn: 'Develop a detailed marketing plan aligned with your business objectives and target market. Outline strategic initiatives for brand positioning, customer engagement, and conversion optimization, including timelines and KPIs. [Insert business objectives].',
    instructionsAr: 'طور خطة تسويقية مفصلة تتماشى مع أهداف عملك وسوقك المستهدف. حدد المبادرات الاستراتيجية لوضع علامتك التجارية، تفاعل العملاء، وتحسين التحويل، بما في ذلك الجداول الزمنية ومؤشرات الأداء الرئيسية. [أدخل أهداف العمل].',
    type: PromptType.Pro,
    usesCounter: 0,
    categoryName: 'Business Hub',
    subcategories: ['Marketing'],
    tools: ['ChatGPT', 'Gemini', 'Claude.ai', 'DeepSeek']
  },
  {
    titleEn: 'Social Media Engagement Plan',
    titleAr: 'خطة تفاعل وسائل التواصل الاجتماعي',
    descriptionEn: 'Develop an effective social media strategy to increase digital engagement and boost brand recognition. Perfect for strengthening online presence.',
    descriptionAr: 'طور استراتيجية فعالة لوسائل التواصل الاجتماعي لزيادة التفاعل الرقمي وتعزيز الاعتراف بالعلامة التجارية. مثالية لتعزيز الحضور الإلكتروني.',
    instructionsEn: 'Construct a strategic social media plan aimed at enhancing online engagement and brand visibility. Detail content themes, optimal posting schedules, and community engagement tactics. [Insert brand and audience details].',
    instructionsAr: 'أنشئ خطة وسائل تواصل اجتماعي استراتيجية تهدف إلى تعزيز التفاعل الإلكتروني ووضوح العلامة التجارية. حدد مواضيع المحتوى، جداول النشر المثلى، وخطط تفاعل المجتمع. [أدخل تفاصيل العلامة التجارية والجمهور].',
    type: PromptType.Pro,
    usesCounter: 0,
    categoryName: 'Business Hub',
    subcategories: ['Marketing'],
    tools: ['ChatGPT', 'Gemini', 'Claude.ai', 'DeepSeek']
  }
];

async function main() {
  // Clear existing data
  await prisma.$transaction([
    prisma.savedPrompt.deleteMany(),
    prisma.promptTool.deleteMany(),
    prisma.promptCategory.deleteMany(),
    prisma.prompt.deleteMany(),
    prisma.tool.deleteMany(),
    prisma.category.deleteMany(),
    prisma.userCatalog.deleteMany(),
    prisma.proMembership.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.user.deleteMany(),
    prisma.adminUser.deleteMany(),
  ]);

  // Create tools
  const createdTools = await Promise.all(
    tools.map(tool => 
      prisma.tool.create({
        data: {
          nameEn: tool.nameEn,
          iconUrl: tool.iconUrl,
        }
      })
    )
  );

  // Create main categories and subcategories
  for (const category of categories) {
    const mainCategory = await prisma.category.create({
      data: {
        nameEn: category.nameEn,
        nameAr: category.nameAr,
        slug: generateSlug(category.nameEn),
        order: category.order,
      },
    });

    // Create subcategories
    await Promise.all(
      category.subcategories.map(sub =>
        prisma.category.create({
          data: {
            nameEn: sub.nameEn,
            nameAr: sub.nameAr,
            slug: generateSlug(sub.nameEn),
            parentCategoryId: mainCategory.id,
            order: 0,
          },
        })
      )
    );
  }

  // Create prompts with their relationships
  for (const prompt of prompts) {
    // Find category
    const category = await prisma.category.findFirst({
      where: { nameEn: prompt.categoryName },
    });

    if (!category) continue;

    // Find subcategories
    const subcategories = await prisma.category.findMany({
      where: {
        nameEn: { in: prompt.subcategories },
        parentCategoryId: { not: null },
      },
    });

    // Find tools
    const toolsToConnect = await prisma.tool.findMany({
      where: {
        nameEn: { in: prompt.tools },
      },
    });

    // Create prompt
    await prisma.prompt.create({
      data: {
        titleEn: prompt.titleEn,
        titleAr: prompt.titleAr,
        type: prompt.type,
        descriptionEn: prompt.descriptionEn,
        descriptionAr: prompt.descriptionAr,
        instructionsEn: prompt.instructionsEn,
        instructionsAr: prompt.instructionsAr,
        usesCounter: prompt.usesCounter,
        categories: {
          create: [
            { category: { connect: { id: category.id } } },
            ...subcategories.map(sub => ({
              category: { connect: { id: sub.id } },
            })),
          ],
        },
        tools: {
          create: toolsToConnect.map(tool => ({
            tool: { connect: { id: tool.id } },
          })),
        },
      },
    });
  }

  console.log('Database has been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
