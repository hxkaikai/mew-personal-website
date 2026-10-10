/*
 * 个人网站内容入口。
 * 实习经历根据本人提供的简历整理；联系方式待补充。
 * 本文件不依赖 ES modules，可直接通过 file:// 预览网站。
 */
window.PROFILE = Object.freeze({
  profile: {
    name: "胡轩恺",
    enName: "Hu Xuankai",
    birth: "2001 年 12 月",
    birthShort: "2001.12",
    hometown: "广东深圳福田",
    hometownShort: "深圳 · 福田",
    tagline: "来健身房找我",
    portrait: null,
    heroVideo: {
      src: "assets/hero-look.mp4",
      poster: "assets/hero-poster.jpg",
      neutralTime: 0.083333,
      // Times are calibrated to the directions visible in the supplied video.
      poses: { right: 2.0, upRight: 3.5, up: 5.0, upLeft: 6.3, left: 7.4, downLeft: 8.5, down: 9.25, downRight: 9.5 }
    }
  },
  education: [
    {
      id: "xiamen-university",
      school: "厦门大学",
      major: "计算机科学与技术",
      degree: "本科",
      start: "2020.09",
      end: "2024.06",
      period: "2020 年 9 月 — 2024 年 6 月",
      label: "Computer Science"
    },
    {
      id: "university-of-international-relations",
      school: "国际关系学院",
      major: "西方经济学",
      degree: "硕士",
      start: "2024.09",
      end: "至今",
      period: "2024 年 9 月 — 至今",
      label: "Economics"
    }
  ],
  internships: [
    {
      company: "字节跳动",
      department: "飞书",
      role: "FDE / 前沿部署工程师",
      period: "2026.07 — 至今",
      summary: "ToB 场景 AI 方案落地与交付",
      highlights: [
        "基于飞书与豆包企业版，主导或参与多行业 AI 交付，覆盖光伏 CRM、银行流水自动对账、制造业车间智能报工、律所邮件结构化入库、金融票据自动归档、销售录音质检与跟进自动化、审批流智能审核等场景。",
        "为北京、上海、广州「豆包企业版 AI 生产力大会」提供素材支持，为多家中小企业现场交付定制化 AI Demo，涉及需求拆解、方案设计与现场交付。"
      ],
      tags: ["AI 交付", "飞书", "豆包企业版"],
      current: true
    },
    {
      company: "美团",
      department: "设计部",
      role: "产品设计师",
      period: "2025.10 — 2026.03",
      summary: "AI 产品评测与交互设计",
      highlights: [
        "参与 NoCode / Catpaw 功能测试，围绕 4 类页面任务，对 4 款模型开展 150+ 轮 UI 生成评估并建立标准评测集；页面生成错误率降低约 22%，后续版本布局生成满意度提升 27%。",
        "使用 Figma / MasterGo 完成 2 个核心模块的交互改版，用户调研反馈操作效率提升约 18%。",
        "参与 PRD 撰写，通过 2 场用户访谈挖掘 9 条痛点，其中 6 条纳入版本迭代计划。"
      ],
      tags: ["UI 评测", "Figma / MasterGo", "用户研究"]
    },
    {
      company: "中信集团 · 北京鸿联九五",
      department: "技术中心",
      role: "行研实习生",
      period: "2025.06 — 2025.09",
      summary: "智能体开发与行业研究",
      highlights: [
        "独立开发「财务助手」智能体，实现 BPO 行业 10+ 维度自动对比，获公司首届智能体大赛前三名。",
        "分析 20+ 家竞品公司年报，完成 4 篇行业研究报告；财务数字化趋势结论被财务部用于季度规划。"
      ],
      tags: ["智能体开发", "行业研究", "财务分析"]
    },
    {
      company: "中国建材集团 · 中建材国贸",
      department: "市场部",
      role: "实习生",
      period: "2025.02 — 2025.05",
      summary: "境外客户资质审核与风控支持",
      highlights: [
        "审核 40+ 个国家 / 地区的境外客户资质，累计处理客户信息、营业执照等材料超 300 份。",
        "独立判断客户来源可靠性与资质合规性，协助完成客户及账户生效与风控流程。"
      ],
      tags: ["客户资质审核", "国际业务", "风控支持"]
    }
  ],
  sports: ["健身", "徒步", "攀岩", "击剑", "钓鱼"],
  musicVideo: {
    src: "assets/music-20-95.mp4",
    poster: "assets/music-poster.jpg",
    label: "厦大信院十佳歌手，音乐现场视频，时长 1 分 15 秒"
  },
  fashionGallery: [
    { id: "fashion-01", label: "设计手稿 01 · 廓形与细节", image: "assets/fashion-01.jpg" },
    { id: "fashion-02", label: "设计手稿 02 · 领口与剪裁", image: "assets/fashion-02.jpg" }
  ],
  game: {
    name: "英雄联盟",
    character: "刀妹",
    image: null,
    videos: [
      { label: "艾瑞莉娅 · 操作片段 01", src: "assets/irelia-01.mp4", poster: "assets/irelia-01-poster.jpg", duration: "00:16" },
      { label: "艾瑞莉娅 · 操作片段 02", src: "assets/irelia-02.mp4", poster: "assets/irelia-02-poster.jpg", duration: "00:16" },
      { label: "艾瑞莉娅 · 操作片段 03", src: "assets/irelia-03.mp4", poster: "assets/irelia-03-poster.jpg", duration: "00:17" }
    ]
  },
  modelGallery: [
    { id: "model-01", label: "模型收藏 01 · 桌面上的小小伙伴", image: "assets/models-01.jpg" },
    { id: "model-02", label: "模型收藏 02 · 骑士陈列", image: "assets/models-02.jpg" },
    { id: "model-03", label: "模型收藏 03 · 银色铠甲", image: "assets/models-03.jpg" },
    { id: "model-04", label: "模型收藏 04 · 红色机车", image: "assets/models-04.jpg" }
  ],
  contact: {
    email: null,
    social: null,
    resume: null
  }
});
