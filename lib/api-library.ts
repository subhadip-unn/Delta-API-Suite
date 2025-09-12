/**
 * 🚀 DELTA API LIBRARY - Unified Dynamic API Configuration
 * 
 * Features:
 * - Dynamic platform selection: /m/, /w/, /i/, /a/, /b/, /v/, /t/
 * - Dynamic version selection: {version}, v2, etc.
 * - Unified structure - no duplicates
 * - Professional, maintainable, scalable
 */

// 🌐 PLATFORM CONFIGURATION
export const PLATFORMS = [
  { id: 'm', name: 'MSite', prefix: '/m/', description: 'Mobile Website' },
  { id: 'w', name: 'Website', prefix: '/w/', description: 'Desktop Website' },
  { id: 'i', name: 'iOS', prefix: '/i/', description: 'iOS App' },
  { id: 'a', name: 'Android', prefix: '/a/', description: 'Android App' },
  { id: 'b', name: 'Backend', prefix: '/b/', description: 'Backend Services' },
  { id: 'v', name: 'Vernacular', prefix: '/v/', description: 'Vernacular Languages' },
  { id: 't', name: 'TV', prefix: '/t/', description: 'TV Platform' }
] as const;

// 📊 VERSION CONFIGURATION
export const VERSIONS = [
  { id: '{version}', name: 'Version 1', description: 'Stable API' },
  { id: 'v2', name: 'Version 2', description: 'Latest API' }
] as const;

// 🌍 ENVIRONMENT CONFIGURATION
export const ENVIRONMENTS = [
  { id: 'prod', name: 'Production', baseUrl: 'http://apiprv.cricbuzz.com' },
  { id: 'staging', name: 'Staging', baseUrl: 'http://api-staging.cricbuzz.com' },
  { id: 'dev', name: 'Development', baseUrl: 'http://api-dev.cricbuzz.com' }
] as const;

// 🎯 UNIFIED API LIBRARY
export const apiLibrary = {
  // 🏠 HOME & DASHBOARD
  home: {
    index: "/{platform}/home/{version}/index",
    matches: "/{platform}/home/{version}/matches",
    miniscore: "/{platform}/matches/{version}/miniscorecard/{id}",
    bottomNavbar: "/{platform}/infra/{version}/menu",
    footerNavMenu: "/{platform}/static/{version}/app-info"
  },

  // 🏏 MATCH CENTER
  match: {
    info: "/{platform}/mcenter/{version}/{id}/info",
    liveScores: "/{platform}/matches/{version}/{pageType}",
    scorecard: "/{platform}/mcenter/{version}/{id}/scard",
    hscorecard: "/{platform}/mcenter/{version}/{id}/hscard",
    fullCommentary: "/{platform}/mcenter/{version}/{id}/fcomm?iid=",
    hfullCommentary: "/{platform}/mcenter/{version}/{id}/hfcomm?iid=",
    miniScore: "/{platform}/mcenter/{version}/{id}/miniscorecard",
    hminiScore: "/{platform}/mcenter/{version}/{id}/hminiscorecard",
    highlights: "/{platform}/mcenter/{version}/{id}/hlights?iid=",
    hhighlights: "/{platform}/mcenter/{version}/{id}/hhlights?iid=",
    comm: "/{platform}/mcenter/{version}/{id}/comm",
    hcomm: "/{platform}/mcenter/{version}/{id}/hcomm",
    squads: "/{platform}/mcenter/{version}/{id}/teams",
    current: "/{platform}/matches/{version}/current",
    liveFeed: "/{platform}/videos/{version}/matchStreamInfo/{id}",
    videos: "/{platform}/snippets/{version}/matchVideos?matchId={id}",
    playerHighlights: "/{platform}/mcenter/{version}/{id}/fcomm?iid={iid}&playerId={playerId}&type={type}",
    hplayerHighlights: "/{platform}/mcenter/{version}/{id}/hfcomm?iid={iid}&playerId={playerId}&type={type}",
    news: "/{platform}/news/{version}/match/{id}",
    photos: "/{platform}/photos/{version}/match/{id}",
    specialAds: "/{platform}/news/{version}/advertorials/index?matchId={matchId}",
    matchOvers: {
      index: "/{platform}/mcenter/{version}/{id}/overs",
      paginationApi: "/api/mcenter/over-by-over"
    }
  },

  // 📰 NEWS & CONTENT
  news: {
    allStories: "/{platform}/news/{version}/index",
    topics: "/{platform}/news/{version}/topics",
    interview: "/{platform}/news/{version}/cat/4",
    editorPick: "/{platform}/news/{version}/cat/2",
    specials: "/{platform}/news/{version}/cat/5",
    stats: "/{platform}/news/{version}/cat/8",
    matchStory: "/{platform}/news/{version}/cat/10",
    opinions: "/{platform}/news/{version}/cat/3",
    premiumArticle: "/{platform}/news/{version}/premiumIndex",
    latestNews: "/{platform}/news/{version}/cat/1",
    detail: "/{platform}/news/{version}/detail/",
    featured: "/{platform}/news/{version}/featured",
    author: {
      articles: "/{platform}/news/{version}/authors/{id}/articles",
      info: "/{platform}/news/{version}/authors/{id}/info"
    },
    expert: "/{platform}/content/{version}/experts/{id}",
    player: "/{platform}/news/{version}/player/{id}",
    series: "/{platform}/news/{version}/series/{id}",
    team: "/{platform}/news/{version}/team/{id}",
    match: "/{platform}/news/{version}/match/{id}"
  },

  // 🎥 VIDEOS & MEDIA
  videos: {
    collection: "/{platform}/videos/{version}/collection/videoIndex",
    detail: "/{platform}/videos/{version}/detail/{videoId}",
    playlistDetail: "/{platform}/videos/{version}/playlist/{id}",
    suggested: "/{platform}/videos/{version}/sugg/{id}",
    playlist: "/{platform}/videos/{version}/playlistdetail",
    category: "/{platform}/videos/{version}/catdetail",
    categoryDetail: "/{platform}/videos/{version}/collection/cat/{id}",
    collectionDetail: "/{platform}/videos/{version}/collection/detail/{id}",
    buzzDetail: "/{platform}/buzz/{version}/get-item?itemType={buzzType}&itemID={buzzId}",
    premiumIndex: "/{platform}/videos/{version}/premiumIndex",
    series: "/{platform}/videos/{version}/series/{id}",
    team: "/{platform}/videos/{version}/team/{id}",
    match: "/{platform}/snippets/{version}/matchVideos?matchId={id}"
  },

  // 🏆 TEAMS & PLAYERS
  teams: {
    info: "/{platform}/teams/{version}/{id}/info",
    list: "/{platform}/teams/{version}/{category}",
    players: "/{platform}/teams/{version}/{id}/players",
    schedule: "/{platform}/teams/{version}/{id}/schedule",
    results: "/{platform}/teams/{version}/{id}/results",
    stats: "/{platform}/stats/{version}/team/{id}",
    news: "/{platform}/news/{version}/team/{id}",
    videos: "/{platform}/videos/{version}/team/{id}",
    photos: "/{platform}/photos/{version}/team/{id}"
  },

  players: {
    profile: "/{platform}/stats/{version}/player/{id}",
    batting: "/{platform}/stats/{version}/player/{id}/batting",
    bowling: "/{platform}/stats/{version}/player/{id}/bowling",
    career: "/{platform}/stats/{version}/player/{id}/career",
    bestranks: "/{platform}/stats/{version}/player/{id}/bestranks",
    trending: "/{platform}/stats/{version}/player/trending",
    search: "/{platform}/stats/{version}/player/search?plrN={searchText}",
    news: "/{platform}/news/{version}/player/{id}"
  },

  // 🏟️ SERIES & VENUES
  series: {
    featured: "/{platform}/series/{version}/featured",
    schedule: "/{platform}/series/{version}/{category}",
    info: "/{platform}/series/{version}/{id}/info",
    matches: "/{platform}/series/{version}/{id}",
    squads: "/{platform}/series/{version}/{id}/squads",
    venues: "/{platform}/series/{version}/{id}/venues",
    history: "/{platform}/series/{version}/{id}/season",
    pointsTable: "/{platform}/stats/{version}/series/{id}/points-table",
    videos: "/{platform}/videos/{version}/series/{id}",
    news: "/{platform}/news/{version}/series/{id}",
    photos: "/{platform}/photos/{version}/series/{id}",
    stats: "/{platform}/stats/{version}/series/{id}",
    highlightslist: "/{platform}/stats/{version}/highlights-list?",
    wicketZone: "/{platform}/stats/{version}/wicket-zone?",
    matchHighlight: "/{platform}/mcenter/{version}/{matchId}/hlights",
    specialContent: "/{platform}/news/{version}/advertorials/index?seriesId={id}"
  },

  venues: {
    detail: "/{platform}/venues/{version}/{id}",
    matches: "/{platform}/venues/{version}/{id}/matches",
    stats: "/{platform}/stats/{version}/venue/{id}"
  },

  // 📊 STATISTICS & RANKINGS
  stats: {
    rankings: "/{platform}/stats/{version}/rankings/{category}?formatType={format}",
    topstats: "/{platform}/stats/{version}/topstats",
    pointstable: "/{platform}/stats/{version}/iccstanding/team/matchtype/{matchTypeId}",
    team: "/{platform}/stats/{version}/team/{id}",
    series: "/{platform}/stats/{version}/series/{id}",
    venue: "/{platform}/stats/{version}/venue/{id}",
    player: "/{platform}/stats/{version}/player/{id}",
    highlightslist: "/{platform}/stats/{version}/highlights-list?",
    wicketZone: "/{platform}/stats/{version}/wicket-zone?"
  },

  // 📅 SCHEDULE & ARCHIVES
  schedule: {
    upcoming: "/{platform}/schedule/{version}/{seriesType}",
    international: "/{platform}/schedule/{version}/international",
    domestic: "/{platform}/schedule/{version}/domestic",
    league: "/{platform}/schedule/{version}/league",
    women: "/{platform}/schedule/{version}/women",
    all: "/{platform}/schedule/{version}/all"
  },

  archives: {
    domestic: "/{platform}/series/{version}/archives/Domestic?year=",
    international: "/{platform}/series/{version}/archives/International?year=",
    league: "/{platform}/series/{version}/archives/league?year=",
    women: "/{platform}/series/{version}/archives/women?year="
  },

  // 🔐 AUTHENTICATION & SUBSCRIPTION
  authentication: {
    sms: "/{platform}/subscription/{version}/country/sms",
    login: "/{platform}/iam/{version}/user/sign-in",
    signUp: "/{platform}/iam/{version}/user/sign-up",
    logout: "/{platform}/iam/{version}/user/sign-out",
    signUpMobile: "/{platform}/iam/{version}/user/update-phone-number",
    verifyOTP: "/{platform}/iam/{version}/user/verify-otp",
    verifyMobileOTP: "/{platform}/iam/{version}/user/update-verify-otp",
    verifyAccessToken: "/{platform}/iam/{version}/user/verify-token",
    verifyRefreshToken: "/{platform}/iam/{version}/user/refresh-token",
    verifyAccess: "/{platform}/iam/{version}/user/verify-access",
    updateUserInfo: "/{platform}/iam/{version}/user/update",
    supportRequest: "/{platform}/notify/{version}/webfeedback",
    contactUs: "/{platform}/notify/{version}/webcontact",
    advertise: "/{platform}/notify/{version}/advertise",
    couponsList: "/{platform}/iam/{version}/user/coupons/list",
    couponCodeDetail: "/{platform}/iam/{version}/user/coupons/{couponId}",
    redeemCoupon: "/{platform}/iam/{version}/user/coupons/redeem",
    paymentTransactions: "/{platform}/iam/{version}/payment/transaction",
    deleteAccount: "/{platform}/iam/{version}/user/delete",
    deals: "/{platform}/iam/{version}/user/coupons/deals",
    unlock: "/{platform}/iam/{version}/user/coupons/unlock",
    payment: "/{platform}/iam/{version}/payment/pay",
    paymentCallback: "/{platform}/iam/{version}/payment/callback/payment",
    partnerRedirect: "/{platform}/iam/{version}/payment/partner-redirect",
    googleLogin: "/{platform}/iam/{version}/user/social/sign-in/google",
    appleLogin: "/{platform}/iam/{version}/user/social/sign-in/apple",
    socialLoginCallback: "/{platform}/iam/{version}/user/social/verify-code?code=",
    signInSettings: "/{platform}/iam/{version}/user/auth-settings/sign-in",
    signUpSettings: "/{platform}/iam/{version}/user/auth-settings/sign-up",
    willowMigration: "/{platform}/iam/{version}/user/migrate/willow-user",
    cancelSubscriptionList: "/{platform}/subscription/{version}/lists/cancel",
    cancelSubscription: "/{platform}/iam/{version}/payment/cancel",
    extendSubscription: "/{platform}/iam/{version}/payment/offer",
    offerList: "/{platform}/iam/{version}/payment/offer/list",
    verifyOffer: "/{platform}/iam/{version}/payment/offer/verify",
    applyOffer: "/{platform}/iam/{version}/payment/offer/apply",
    tveProviderList: "/{platform}/iam/{version}/tve/init",
    startTveSession: "/{platform}/iam/{version}/tve/session/start",
    resumeTveSession: "/{platform}/iam/{version}/tve/session/resume",
    verifyTveSession: "/{platform}/iam/{version}/tve/session/verify",
    refreshTveAccessToken: "/{platform}/iam/{version}/tve/refresh-token",
    logoutTveSession: "/{platform}/iam/{version}/tve/logout",
    tvCodeLogin: "/{platform}/iam/{version}/tve/session/tv/{code}",
    pollTveSession: "/{platform}/iam/{version}/tve/profiles/code",
    onSignIn: "/{platform}/iam/{version}/user/on-sign-in"
  },

  subscription: {
    feedback: "/{platform}/subscription/{version}/lists/feedback",
    plans: "/{platform}/subscription/{version}/plandetail",
    planTermSummary: "/{platform}/subscription/{version}/plantermdetail",
    cancelSubscription: "/{platform}/subscription/{version}/lists/cancel",
    cbplusFaqs: "/{platform}/static/{version}/cb-plus-terms"
  },

  // 💎 CB PLUS PREMIUM
  cbplus: {
    trending: "/{platform}/home/{version}/premiumIndex",
    videos: "/{platform}/videos/{version}/premiumIndex",
    editorials: "/{platform}/news/{version}/premiumIndex",
    videosCollection: "/{platform}/videos/{version}/collection/premiumIndex",
    willowFaqs: "/{platform}/static/{version}/willow-faqs",
    fantasy: {
      index: "/{platform}/fantasy/{version}/index/{matchId}",
      player: "/{platform}/fantasy/{version}/playerInfo/{playerId}",
      venue: "/{platform}/fantasy/{version}/venueInfo/{matchId}",
      allPlayers: "/{platform}/fantasy/{version}/allPlayers/{matchId}",
      matchUps: "/{platform}/fantasy/{version}/matchUps/{matchId}",
      expertPick: "/{platform}/fantasy/{version}/expertPick/{matchId}"
    }
  },

  // 🏆 IPL AUCTION
  iplAuction: {
    upcoming: "/{platform}/auction/{version}/players/upcoming",
    completed: "/{platform}/auction/{version}/players/completed",
    live: "/{platform}/auction/{version}/players/live",
    teams: "/{platform}/auction/{version}/teams",
    team: "/{platform}/auction/{version}/team/{teamId}",
    player: "/{platform}/auction/{version}/player/{playerId}",
    playerSearch: "/{platform}/auction/{version}/playerSearch?plrN={searchText}&year={year}&tournament={tournament}",
    faq: "/{platform}/auction/{version}/faq?tournament={tournament}&year={year}",
    teamSort: "/{platform}/auction/{version}/teams?currency={currency}&sort={sort}&year={year}&tournament={tournament}",
    seasons: "/{platform}/auction/{version}/seasons"
  },

  // 📸 PHOTOS & GALLERY
  photos: {
    all: "/{platform}/photos/{version}/index",
    detail: "/{platform}/photos/{version}/detail/",
    series: "/{platform}/photos/{version}/series/{id}",
    team: "/{platform}/photos/{version}/team/{id}",
    match: "/{platform}/photos/{version}/match/{id}"
  },

  // 🔍 SEARCH & DISCOVERY
  search: {
    suggestions: "/{platform}/esearch/{version}/sugg/",
    results: "/{platform}/esearch/{version}/detail?q=",
    events: "/{platform}/esearch/{version}/save",
    trendingPlayers: "/{platform}/stats/{version}/player/trending"
  },

  // 📚 TOPICS & CATEGORIES
  topics: {
    all: "/{platform}/news/{version}/topics",
    details: "/{platform}/news/{version}/topics/{id}",
    ajaxUrl: "/{platform}/news/{version}/topics/{id}?lastId="
  },

  // 🎯 QUIZ & INTERACTIVE
  quiz: {
    index: "/{platform}/quizzes/{version}/index",
    detail: "/{platform}/quizzes/{version}/details/"
  },

  // 🎪 SPECIAL CONTENT
  specials: {
    boostometer: {
      apiBasePath: "live-feeds.service.consul",
      tournamentIndex: "/cricbuzz/ads/demo/campaign/boostometer/tournament-index.json?",
      matchIndex: "/cricbuzz/ads/demo/campaign/boostometer/match-index.json?",
      allTime: "/cricbuzz/ads/demo/campaign/boostometer/allTime.json?"
    },
    specialContent: {
      seriesList: "/{platform}/news/{version}/advertorials/index?seriesId={id}",
      seriesMatch: "/{platform}/news/{version}/advertorials/index?matchId={id}"
    }
  },

  // 💬 MATCH PARTY CHAT
  matchPartyChat: {
    chatBox: "/{platform}/iam/{version}/user/chat/get-chatbox",
    chatGuidelines: "/{platform}/iam/{version}/user/chat/guidelines"
  },

  // 🏢 CAREERS
  careers: {
    index: "/{platform}/career/{version}/Index",
    details: "/{platform}/career/{version}/Detail/{id}",
    formSubmit: "/{platform}/notify/{version}/career"
  },

  // 🎨 ADVERTISEMENTS
  adverts: {
    pageDetails: "/{platform}/site-ads/{version}/{pageName}",
    specialNews: {
      index: "/{platform}/site-ads/{version}/specialNews/index/{matchId}",
      detail: "/{platform}/site-ads/{version}/specialNews/detail/{specialStoryId}"
    }
  },

  // 🔧 SEO & META
  seo: {
    siteDetails: "/{platform}/meta/{version}/sitedetails/all",
    pageDetails: "/{platform}/meta/{version}/pagedetails/getOne/{pageName}",
    robots: "/{platform}/seo/{version}/robots/all"
  },

  // 📄 STATIC PAGES
  staticPages: {
    privacy: "/{platform}/static/{version}/privacy-policy",
    aboutUs: "/{platform}/static/{version}/about-us",
    termsOfUse: "/{platform}/static/{version}/terms-of-use",
    copyright: "/{platform}/static/{version}/copyright",
    faq: "/{platform}/static/{version}/cb-plus-terms",
    policyTil: "/{platform}/static/{version}/privacy-policy-til",
    termsTil: "/{platform}/static/{version}/terms-of-use-til",
    videoViewingPolicy: "/{platform}/static/{version}/video-viewing-policy",
    yourPrivacyChoices: "/{platform}/static/{version}/your-privacy-choices",
    cookieSdkPolicy: "/{platform}/static/{version}/cookie-policy"
  },

  // 🖼️ IMAGES & ASSETS
  images: {
    url: "https://static.cricbuzz.com/a/img/{version}/{w}x{h}/i1/c{id}/{imageName}.jpg",
    cbImageUrl: "https://static.cricbuzz.com/a/img/{version}/i1/c{id}/{imageName}.jpg?d=high&p={imageType}"
  },

  // 🎮 WIDGETS & EXTERNAL
  cbadwidget: {
    url: "https://partner.mpl.live/efx/get-category-wise-questions?category="
  },

  // 🌐 DOMAIN & EXTERNAL
  cricbuzzDomain: "https://www.cricbuzz.com/",
  haveYourSayLink: "/{platform}/admin/{version}/userFeedback/upsert",
  tveSession: "/{platform}/iam/{version}/tve/session/tv/{code}"
};

// 🛠️ UTILITY FUNCTIONS
export const generateApiUrl = (
  apiPath: string,
  platform: string = 'm',
  version: string = '{version}',
  parameters: Record<string, string> = {}
): string => {
  let url = apiPath
    .replace(/{platform}/g, platform)
    .replace(/{version}/g, version);
  
  // Replace parameters
  Object.entries(parameters).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, value);
  });
  
  return url;
};

export const getBaseUrl = (environment: string = 'prod'): string => {
  const env = ENVIRONMENTS.find(e => e.id === environment);
  return env?.baseUrl || ENVIRONMENTS[0].baseUrl;
};

export const getFullApiUrl = (
  apiPath: string,
  platform: string = 'm',
  version: string = '{version}',
  environment: string = 'prod',
  parameters: Record<string, string> = {}
): string => {
  const baseUrl = getBaseUrl(environment);
  const apiUrl = generateApiUrl(apiPath, platform, version, parameters);
  return `${baseUrl}${apiUrl}`;
};

// 📊 API CATEGORIES FOR UI
export const API_CATEGORIES = [
  { id: 'home', name: 'Home & Dashboard', icon: '🏠' },
  { id: 'match', name: 'Match Center', icon: '🏏' },
  { id: 'news', name: 'News & Content', icon: '📰' },
  { id: 'videos', name: 'Videos & Media', icon: '🎥' },
  { id: 'teams', name: 'Teams & Players', icon: '🏆' },
  { id: 'series', name: 'Series & Venues', icon: '🏟️' },
  { id: 'stats', name: 'Statistics', icon: '📊' },
  { id: 'schedule', name: 'Schedule', icon: '📅' },
  { id: 'authentication', name: 'Authentication', icon: '🔐' },
  { id: 'cbplus', name: 'CB Plus Premium', icon: '💎' },
  { id: 'iplAuction', name: 'IPL Auction', icon: '🏆' },
  { id: 'search', name: 'Search & Discovery', icon: '🔍' },
  { id: 'quiz', name: 'Quiz & Interactive', icon: '🎯' },
  { id: 'special', name: 'Special Content', icon: '🎪' }
] as const;

export type PlatformId = typeof PLATFORMS[number]['id'];
export type VersionId = typeof VERSIONS[number]['id'];
export type EnvironmentId = typeof ENVIRONMENTS[number]['id'];
export type ApiCategoryId = typeof API_CATEGORIES[number]['id'];
