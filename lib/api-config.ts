const getBasePath = () => {
    // For browser environment, use default values
    return "http://apiprv.cricbuzz.com";
};

const setAPIVersion = () => {   
    // For browser environment, use v1 as default
    return "v1";
};

export const apiConfig = {
    basePath: getBasePath(),
    seoBasepath: getBasePath(),
    basepathOLD: "http://apiprv.cricbuzz.com",
    SecurePrivacy: "/m/iam/v1/user/on-sign-in",
    home: {
        index: "/m/home/v1/index",
        matches: `/m/home/${setAPIVersion()}/matches`,
        miniscore: "/m/matches/v1/miniscorecard/{id}",
        bottomNavbar: "/m/infra/v1/menu",
        footerNavMenu: "/m/static/v1/app-info"
    },
    match: {
        info: "/m/mcenter/v1/{id}/info",
        liveScores: "/m/matches/v1/{pageType}",
        matchOvers: {
            index: `/m/mcenter/${setAPIVersion()}/{id}/overs`,
            paginationApi: "/api/mcenter/over-by-over",
        },
        scorecard: `/m/mcenter/${setAPIVersion()}/{id}/scard`,
        hscorecard: "/m/mcenter/v1/{id}/hscard",
        fullCommentary: "/m/mcenter/v1/{id}/fcomm?iid=",
        hfullCommentary: "/m/mcenter/v1/{id}/hfcomm?iid=",
        miniScore: "/m/mcenter/v1/{id}/miniscorecard",
        hminiScore: "/m/mcenter/v1/{id}/hminiscorecard",
        highlights: "/m/mcenter/v1/{id}/hlights?iid=",
        hhighlights: "/m/mcenter/v1/{id}/hhlights?iid=",
        comm: `/m/mcenter/${setAPIVersion()}/{id}/comm`,
        hcomm: "/m/mcenter/v1/{id}/hcomm",
        squads: "/m/mcenter/v1/{id}/teams",
        current: "/m/matches/v1/current",
        liveFeed: "/m/videos/v1/matchStreamInfo/{id}",
        videos: "/m/snippets/v1/matchVideos?matchId={id}",
        playerHighlights:
            "/m/mcenter/v1/{id}/fcomm?iid={iid}&playerId={playerId}&type={type}",
        hplayerHighlights:
            "/m/mcenter/v1/{id}/hfcomm?iid={iid}&playerId={playerId}&type={type}",
        news: "m/news/v1/match/{id}",
        photos: "/m/photos/v1/match/{id}",
        specialAds: "/m/news/v1/advertorials/index?matchId={matchId}",
    },
    news: {
        allStories: "/w/news/v1/index",
        topics: "/w/news/v1/topics",
        interview: "/w/news/v1/cat/4",
        editorPick: "/w/news/v1/cat/2",
        specials: "/w/news/v1/cat/5",
        stats: "/w/news/v1/cat/8",
        matchStory: "/w/news/v1/cat/10",
        opinions: "/w/news/v1/cat/3",
        premiumArticle: "/w/news/v1/premiumIndex",
        latestNews: "/w/news/v1/cat/1",
        paginationApi: "/api/cricket-news",
        detail: "/w/news/v1/detail/",
        author: {
            articles: "/w/news/v1/authors/{id}/articles",
            info: "/w/news/v1/authors/{id}/info",
        },
        expert: "/w/content/v1/experts/{id}",
        featured: "/w/news/v1/featured",
    },
    videos: {
        cricketVideos: "/m/videos/v1/collection/videoIndex",
        detail: "/m/videos/v1/detail/{videoId}",
        playlistDetail: "/m/videos/v1/playlist/{id}",
        suggested: "/m/videos/v1/sugg/{id}",
        playlist: "/m/videos/v1/playlistdetail",
        category: "/m/videos/v1/catdetail",
        categoryDetail: "/m/videos/v1/collection/cat/{id}",
        collectionDetail: "/m/videos/v1/collection/detail/{id}",
		buzzDetail : "/m/buzz/v1/get-item?itemType={buzzType}&itemID={buzzId}",
    },
    teams: {
        info: `/m/teams/${setAPIVersion()}/{id}/info`,
        list: `/m/teams/${setAPIVersion()}/{category}`,
        players: `/m/teams/${setAPIVersion()}/{id}/players`,
        schedule: "/m/teams/v1/{id}/schedule",
        results: `/m/teams/${setAPIVersion()}/{id}/results`,
        stats: "/m/stats/v1/team/{id}",
        news: "/m/news/v1/team/{id}",
        videos: "/m/videos/v1/team/{id}",
        photos: "/m/photos/v1/team/{id}",
    },
    archives: {
        Domestic: `/m/series/${setAPIVersion()}/archives/Domestic?year=`,
        International: `/m/series/${setAPIVersion()}/archives/International?year=`,
        League: `/m/series/${setAPIVersion()}/archives/league?year=`,
        Women: `/m/series/${setAPIVersion()}/archives/women?year=`,
    },
    schedule: {
        upcoming: "/m/schedule/v1/{seriesType}",
    },
    adverts: {
        pageDetails: "/m/site-ads/v1/{pageName}",
        pageDetailsWeb: "/w/site-ads/v1/{pageName}",
    },
    seo: {
        pageDetails: "/w/meta/v1/pagedetails/getOne/{pageName}",
        robots: "/w/seo/v1/robots/all",
    },
    series: {
        featured: "/m/series/v1/featured",
        schedule: `/m/series/${setAPIVersion()}/{category}`,
        info: `/m/series/${setAPIVersion()}/{id}/info`,
        matches: "/m/series/v1/{id}",
        pointsTable: "/w/stats/v1/series/{id}/points-table",
        squads: `/m/series/${setAPIVersion()}/{id}/squads`,
        stats: "/w/stats/v1/series/{id}",
        news: "/m/news/v1/series/{id}",
        photos: "/m/photos/v1/series/{id}",
        videos: "/m/videos/v1/series/{id}",
        venues: `/m/series/${setAPIVersion()}/{id}/venues`,
        wicketZone: "/m/stats/v1/{type}?",
        matchHighlight: "/m/mcenter/v1/{matchId}/hlights",
        splContentseriesList: "/m/news/v1/advertorials/index?seriesId={id}",
    },
    venues: {
        venueDetail: `/m/venues/${setAPIVersion()}/{id}`,
        venueMatches: `/m/venues/${setAPIVersion()}/{id}/matches`,
        venueStats: "/m/stats/v1/venue/{id}",
    },
    images: {
        url: "https://static.cricbuzz.com/a/img/v1/{w}x{h}/i1/c{id}/{imageName}.jpg",
    },
    cbadwidget: {
        url: "https://partner.mpl.live/efx/get-category-wise-questions?category=",
    },
    cbImageUrl:
        "https://static.cricbuzz.com/a/img/v1/i1/c{id}/{imageName}.jpg?d=high&p={imageType}",
    subscription: {
        feedback: "/m/subscription/v1/lists/feedback",
        plans: "/m/subscription/v1/plandetail",
        planTermSummary: "/m/subscription/v1/plantermdetail",
    },
    cbplus: {
        trending: "/m/home/v1/premiumIndex",
        videos: "/m/videos/v1/premiumIndex",
        editorials: "/w/news/v1/premiumIndex",
        videosCollection: "/m/videos/v1/collection/premiumIndex",
        willowFaqs: "/m/static/v1/willow-faqs",
        fantasy: {
            index: "/m/fantasy/v1/index/{matchId}",
            player: "/m/fantasy/v1/playerInfo/{playerId}",
            venue: "/m/fantasy/v1/venueInfo/{matchId}",
            allPlayers: "/m/fantasy/v1/allPlayers/{matchId}",
            matchUps: "/m/fantasy/v1/matchUps/{matchId}",
            expertPick: "/m/fantasy/v1/expertPick/{matchId}",
        },
        authentication: {
            sms: "/m/subscription/v1/country/sms",
            login: "/m/iam/v1/user/sign-in",
            signUp: "/m/iam/v1/user/sign-up",
            logout: "/m/iam/v1/user/sign-out",
            signUpMobile: "/m/iam/v1/user/update-phone-number",
            verifyOTP: "/m/iam/v1/user/verify-otp",
            verifyMobileOTP: "/m/iam/v1/user/update-verify-otp",
            verifyAccessToken: "/m/iam/v1/user/verify-token",
            verifyRefreshToken: "/m/iam/v1/user/refresh-token",
            verifyAccess: "/m/iam/v1/user/verify-access",
            updateUserInfo: "/m/iam/v1/user/update",
            supportRequest: "/m/notify/v1/webfeedback",
            contactUs: "/w/notify/v1/webcontact",
            advertise: "/m/notify/v1/advertise",
            couponsList: "/m/iam/v1/user/coupons/list",
            couponCodeDetail: "/m/iam/v1/user/coupons/{couponId}",
            redeemCoupon: "/m/iam/v1/user/coupons/redeem",
            paymentTransactions: "/m/iam/v1/payment/transaction",
            deleteAccount: "/m/iam/v1/user/delete",
            deals: "/m/iam/v1/user/coupons/deals",
            unlock: "/m/iam/v1/user/coupons/unlock",
            payment: "/m/iam/v1/payment/pay",
            paymentCallback: "/m/iam/v1/payment/callback/payment",
            partnerRedirect: "/m/iam/v1/payment/partner-redirect",
            googleLogin: "/m/iam/v1/user/social/sign-in/google",
            appleLogin: "/m/iam/v1/user/social/sign-in/apple",
            socialLoginCallback: "/m/iam/v1/user/social/verify-code?code=",
            signInSettings: "/m/iam/v1/user/auth-settings/sign-in",
            signUpSettings: "/m/iam/v1/user/auth-settings/sign-up",
            willowMigration: "/m/iam/v1/user/migrate/willow-user",
            cancelSubscriptionList: "/m/subscription/v1/lists/cancel",
            cancelSubscription: "/m/iam/v1/user/cancel",
            extendSubscription: "/m/iam/v1/payment/offer",
            offerList: "/m/iam/v1/payment/offer/list",
            verifyOffer: "/m/iam/v1/payment/offer/verify",
            applyOffer: "/m/iam/v1/payment/offer/apply",
            tveProviderList: "/m/iam/v1/tve/init",
            startTveSession: "/m/iam/v1/tve/session/start",
            resumeTveSession: "/m/iam/v1/tve/session/resume",
            verifyTveSession: "/m/iam/v1/tve/session/verify",
            refreshTveAccessToken: "/m/iam/v1/tve/refresh-token",
            logoutTveSession: "/m/iam/v1/tve/logout",
            tvCodeLogin: "/t/iam/v1/tve/session/tv/{code}",
            pollTveSession: "/m/iam/v1/tve/profiles/code",
        },
    },
    photos: {
        all: "/m/photos/v1/index",
        detail: "/m/photos/v1/detail/",
    },
    players: {
        trending: "/m/stats/v1/player/trending",
        search: "/b/stats/v1/player/search?plrN={searchText}",
        news: "/m/news/v1/player/{id}",
        batting: `/m/stats/${setAPIVersion()}/player/{id}/batting`,
        bowling: `/m/stats/${setAPIVersion()}/player/{id}/bowling`,
        career: `/m/stats/${setAPIVersion()}/player/{id}/career`,
        playerProfile: `/m/stats/${setAPIVersion()}/player/{id}`
    },
    stats: {
        rankings: "/m/stats/v1/rankings/{category}?formatType={format}",
        topstats: "/m/stats/v1/topstats",
    },
    pointstable: "/m/stats/v1/iccstanding/team/matchtype/{matchTypeId}",
    iplAuction: {
        upcoming: "/m/auction/v1/players/upcoming",
        completed: "/m/auction/v1/players/completed",
        live: "/m/auction/v1/players/live",
        teams: "/m/auction/v1/teams",
        team: "/m/auction/v1/team/{teamId}",
        player: "/m/auction/v1/player/{playerId}",
        playerSearch: "/m/auction/v1/playerSearch?plrN={searchText}&year={year}&tournament={tournament}",
        faq: "/m/auction/v1/faq?tournament={tournament}&year={year}",
        teamSort: "/m/auction/v1/teams?currency={currency}&sort={sort}&year={year}&tournament={tournament}",
        seasons: "/m/auction/v1/seasons"
    },
    careers: {
        index: "/w/career/v1/Index",
        details: "/w/career/v1/Detail/{id}",
        formSubmit: "/w/notify/v1/career",
    },
    staticPages: {
        privacy: "/i/static/v1/privacy-policy",
        aboutUs: "/i/static/v1/about-us",
        termsOfUse: "/i/static/v1/terms-of-use",
        copyright: "/i/static/v1/copyright",
        faq: "/i/static/v1/cb-plus-terms",
        policyTil : "/m/static/v1/privacy-policy-til",
        termsTil : "/m/static/v1/terms-of-use-til",
        videoViewingPolicy: "/m/static/v1/video-viewing-policy",
        yourPrivacyChoices: "/m/static/v1/your-privacy-choices",
        cookieSdkPolicy : "/m/static/v1/cookie-policy"
    },
    cricbuzzDomain: "https://www.cricbuzz.com/",
    haveYourSayLink: "/b/admin/v1/userFeedback/upsert",
    tveSession: "/t/iam/v1/tve/session/tv/{code}",
};

export const dynamicRoutes = {
    login: "/api/cbplus/auth/user/login",
    signUp: "/api/cbplus/auth/user/sign-up",
    socialLogin: "/api/cbplus/auth/user/social-login/{socialAuthType}",
    signUpMobile: "/api/cbplus/auth/user/sign-up-mobile",
    verifyMobileOtp: "/api/cbplus/auth/user/verify-mobile-otp",
    verifyOtp: "/api/cbplus/auth/user/verify-otp",
    verifyAccessToken: "/api/cbplus/auth/user/verify-token",
    verifyTveSession: "/api/cbplus/auth/user/verify-tve-session",
    startTveSession: "/api/cbplus/auth/user/start-tve-session",
    resumeTveSession: "/api/cbplus/auth/user/resume-tve-session",
    pollSession: "/api/cbplus/auth/user/tve-auth-poll",
    verifyTveRefreshToken: "/api/cbplus/auth/user/refresh-tve-access-token",
    verifyAccess: "/api/cbplus/auth/user/verify-access",
    verifyRefreshToken: "/api/cbplus/auth/user/refresh-token",
    willowMigration: "/api/cbplus/auth/user/willow-migration",
    updateUserInfo: "/api/cbplus/auth/user/update-profile",
    logout: "/api/cbplus/auth/user/logout",
    delete: "/api/cbplus/auth/user/delete-account",
    supportRequest: "/api/info/support",
    contactUs: "/api/info/contact",
    advertise: "/api/info/advertise",
    couponsList: "/api/cbplus/auth/user/coupons-list",
    couponCodeDetail: "/api/cbplus/auth/user/coupon-code-detail",
    redeemCoupon: "/api/cbplus/auth/user/redeem-coupon",
    paymentTransactions: "/api/cbplus/auth/user/payment-transactions",
    planDetails: "/api/cbplus/auth/user/plan-detail",
    termPlanSummary: "/api/cbplus/premium/plan-term-modal-content",
    dealsList: "/api/cbplus/auth/user/deals-list",
    userDealsList: "/api/cbplus/auth/subscribed-user/deals-list",
    unlockDeal: "/api/cbplus/auth/subscribed-user/deal-detail/unlock",
    userDealDetail: "/api/cbplus/auth/subscribed-user/deal-detail/deals",
    careerFormSubmit: "/api/info/career",
    nonUserDealDetail: "/api/cbplus/auth/non-user/deal-detail/{id}",
    plusContentApis: {
        news: "/api/cbplus/premium-content/news",
    },
    videoDetails: "/api/cbplus/premium-content/video/{videoId}",
    videos: {
        videoDetails: "/api/cbplus/premium-content/video/{videoId}",
        pagination: {
            videosHomePage: "/api/cricket-videos/{order}",
            categoryDetails:
                "/api/cricket-videos/category-pagination/{id}/{lastPt}",
            playlistDetails:
                "/api/cricket-videos/playlist-pagination/{id}/{lastPt}",
            collectionDetails:
                "/api/cricket-videos/collection-pagination/{id}/{lastPt}",
        },
    },
    fantasy: {
        tabs: "/api/cbplus/premium-content/fantasy-handbook/{tab}/{matchId}",
        playerInfo:
            "/api/cbplus/premium-content/fantasy-handbook/player-profile/{playerId}/{matchId}",
    },
    match: {
        highlights: "/api/mcenter/highlights/{matchId}/{inningId}",
        hhighlights: "/api/mcenter/hhighlights/{matchId}/{inningId}",
        commentaryPagination:
            "/api/mcenter/commentary-pagination/{matchId}/{inningId}/{lastTimestamp}",
        hcommentaryPagination:
            "/api/mcenter/hcommentary-pagination/{matchId}/{inningId}/{lastTimestamp}",
        videos: "/api/mcenter/cricket-match-videos/{matchId}/{lastTimestamp}",
        liveStreamVideos:
            "/api/mcenter/{matchId}/highlights/{videoType}/{lastPt}",
        miniScore: "/api/mcenter/{matchId}/miniscore",
        hminiScore: "/api/mcenter/{matchId}/hminiscore",
        fullCommentary: "/api/mcenter/{matchId}/full-commentary/{inningId}",
        hfullCommentary: "/api/mcenter/{matchId}/hfull-commentary/{inningId}",
        news: "/api/mcenter/news/{matchId}/{lastNewsId}",
    },
    pointstable: "/api/points-table/{matchTypeId}/{seasonId}",
    seriesSquads: "/api/cricket-series/series-squads/{seriesId}/{squadId}",
    cricketgallery: "/api/cricket-gallery/paginate/gallery-list/{publishTime}",
    teamBoundaryTracker:
        "/api/boundary-tracker/{seriesType}/{seriesId}/{teamId}",
    iplAuction: {
        playerSearch: "/api/ipl-auction/search",
        seasons: "/api/ipl-auction/seasons",
        faq: "/api/ipl-auction/faq"
    },
    payment: "/cbplus/payment/user/pymnt",
    partnerRedirect: "/cbplus/payment/user/partner-redirect",
    willowFaqs: "/api/cbplus/premium-content/willow-faqs",
    cancelSubscription: "/api/cbplus/payment/user/subscription/cancel",
    offer_extention:
        "/api/cbplus/payment/user/subscription/extend_subscription",
    offerList: "/api/cbplus/payment/user/cancellation/offer/list",
    verifyOffer: "/api/cbplus/payment/user/cancellation/offer/verify",
    applyOffer: "/api/cbplus/payment/user/cancellation/offer/apply",
    haveYourSay: "/api/info/have-your-say",
    getTveProviderList: "/api/cbplus/auth/user/tve-provider-list/{identifier}",
    tvSessionLogin: "/api/cbplus/auth/user/tve-code-login/{code}",
    onSignIn : "/api/secure-privacy/on-sign-in",
    
    // Additional APIs from website config
    stats: {
        rankings: "/w/stats/v1/rankings/{category}?formatType={format}",
        pointstable: "/w/stats/v1/iccstanding/team/matchtype/{matchTypeId}",
    },
    series: {
        featured: "/w/series/v1/featured",
        category: "/w/series/v1/{category}",
        info: "/w/series/v1/{id}/info",
        matches: "/w/series/v1/{id}",
        squads: "/w/series/v1/{id}/squads",
        venues: "/w/series/v1/{id}/venues",
        history: "/w/series/v1/{id}/season",
        pointstable: "/w/stats/v1/series/{id}/points-table",
        videos: "/w/videos/v1/series/{id}",
        news: "/w/news/v1/series/{id}",
        photos: "/w/photos/v1/series/{id}",
        stats: "/w/stats/v1/series/{id}",
        highlightslist: "/w/stats/v1/highlights-list?",
        wicket_zone: "/w/stats/v1/wicket-zone?"
    },
    venues: {
        detail: "/w/venues/v1/{id}",
        matches: "/w/venues/v1/{id}/matches",
        stats: "/w/stats/v1/venue/{id}"
    },
    teams: {
        info: "/w/teams/v1/{id}/info",
        news: "/w/news/v1/team/{id}",
        list: "/w/teams/v1/{category}",
        videos: "/w/videos/v1/team/{id}",
        results: "/w/teams/v1/{id}/results",
        schedule: "/w/teams/v1/{id}/schedule",
        stats: "/w/stats/v1/team/{id}",
        players: "/w/teams/v1/{id}/players",
        photos: "/w/photos/v1/team/{id}"
    },
    images: {
        url: "/a/img/v1/{mxn}/i1/c{id}/{imagename}.jpg"
    },
    websiteVideos: {
        all: {
            url: "/w/videos/v1/collection/videoIndex",
            ajax_url: "?order="
        },
        index: "/w/videos/v1/index",
        suggested: "/w/videos/v1/sugg/{id}",
        playlist: "/w/videos/v1/playlistdetail",
        playlistDetail: "/w/videos/v1/playlist/{id}",
        category: "/w/videos/v1/catdetail",
        categoryDetail: "/w/videos/v1/collection/cat/{id}",
        detail: "/w/videos/v1/detail/",
        collectionDetail: "/w/videos/v1/collection/detail/{id}",
        buzzDetail: "/w/buzz/v1/get-item?itemType={buzzType}&itemID={buzzId}",
    },
    search: {
        suggestions: "/w/esearch/v1/sugg/",
        results: "/w/esearch/v1/detail?q=",
        events: "/w/esearch/v1/save",
        trending_players: "/w/stats/v1/player/trending"
    },
    topics: {
        all: "/w/news/v1/topics",
        details: {
            url: "/w/news/v1/topics/{id}",
            ajax_url: "/w/news/v1/topics/{id}?lastId="
        },
    },
    schedule: {
        upcoming: {
            international: {
                url: "/w/schedule/v1/international",
                ajax_url: "/w/schedule/v1/international?lastTime="
            },
            domestic: {
                url: "/w/schedule/v1/domestic",
                ajax_url: "/w/schedule/v1/domestic?lastTime="
            },
            league: {
                url: "/w/schedule/v1/league",
                ajax_url: "/w/schedule/v1/league?lastTime="
            },
            women: {
                url: "/w/schedule/v1/women",
                ajax_url: "/w/schedule/v1/women?lastTime="
            },
            all: {
                url: "/w/schedule/v1/all",
                ajax_url: "/w/schedule/v1/all?lastTime="
            }
        }
    },
    archives: {
        Domestic: "/w/series/v1/archives/Domestic?year=",
        International: "/w/series/v1/archives/International?year=",
        League: "/w/series/v1/archives/league?year=",
        Women: "/w/series/v1/archives/women?year=",
    },
    player: {
        profile: "/w/stats/v1/player/{id}",
        bowling: "/w/stats/v1/player/{id}/bowling",
        batting: "/w/stats/v1/player/{id}/batting",
        career: "/w/stats/v1/player/{id}/career",
        bestranks: "/w/stats/v1/player/{id}/bestranks"
    },
    photos: {
        all: "/w/photos/v1/index",
        detail: "/w/photos/v1/detail/"
    },
    adverts: {
        url: "/w/site-ads/v1/{page_name}"
    },
    seo: {
        site_details: "/w/meta/v1/sitedetails/all",
        page_details: "/w/meta/v1/pagedetails/getOne/{page_name}",
        robots: "/w/seo/v1/robots/all"
    },
    quiz: {
        index: "/w/quizzes/v1/index",
        detail: "/w/quizzes/v1/details/",
    },
    specials: {
        boostometer: {
            apiBasePath: "live-feeds.service.consul",
            tournament_index: "/cricbuzz/ads/demo/campaign/boostometer/tournament-index.json?",
            match_index: "/cricbuzz/ads/demo/campaign/boostometer/match-index.json?",
            all_time: "/cricbuzz/ads/demo/campaign/boostometer/allTime.json?"
        },
        special_content: {
            series_list: "/w/news/v1/advertorials/index?seriesId={id}",
            series_match: "/w/news/v1/advertorials/index?matchId={id}",
        }
    },
    subscription: {
        cbplus_faqs: "/w/static/v1/cb-plus-terms",
        plans: "/w/subscription/v1/plandetail",
        plan_term_detail: "/w/subscription/v1/plantermdetail",
        feedback: "/w/subscription/v1/lists/feedback",
        cancel_subscription: "/w/subscription/v1/lists/cancel",
    },
    cricbuzzPlusAuth: {
        sign_up: "/w/iam/v1/user/sign-up",
        sign_up_mobile: "/w/iam/v1/user/update-phone-number",
        login: "/w/iam/v1/user/sign-in",
        logout: "/w/iam/v1/user/sign-out",
        verify: "/w/iam/v1/user/verify-otp",
        verify_mobile: "/w/iam/v1/user/update-verify-otp",
        verify_token: "/w/iam/v1/user/verify-token",
        refresh_token: "/w/iam/v1/user/refresh-token",
        tve_refresh_token: "/w/iam/v1/tve/refresh-token",
        tve_profiles_code: "/w/iam/v1/tve/profiles/code",
        tve_redirection_url: "/t/iam/v1/tve/session/tv/",
        update: "/w/iam/v1/user/update",
        google_login: "/w/iam/v1/user/google/sign-in",
        google_callback: "/w/iam/v1/user/google/callback?code={calback_code}",
        payment: "/w/iam/v1/payment/pay",
        payment_callback: "/w/iam/v1/payment/callback/payment",
        payment_widget: "/w/iam/v1/payment/widget/{userId}",
        transactions: "/w/iam/v1/payment/transaction",
        cancel: "/w/iam/v1/payment/cancel",
        coupons_list: "/w/iam/v1/user/coupons/list",
        redeem_coupon: "/w/iam/v1/user/coupons/redeem",
        coupon_code: "/w/iam/v1/user/coupons",
        support_request: "/w/notify/v1/webfeedback",
        contactUs_request: "/w/notify/v1/webcontact",
        Advertise_request: "/w/notify/v1/advertise",
        career_request: "/w/notify/v1/career",
        career_list: "/w/career/v1/Index",
        career_detail: "/w/career/v1/Detail/id",
        deals: "/w/iam/v1/user/coupons/deals",
        unlock: "/w/iam/v1/user/coupons/unlock",
        verify_access: "/w/iam/v1/user/verify-access",
        get_client_otp: "/f/iam/v1/timwe/get-number",
        verify_client_otp: "/f/iam/v1/timwe/verify-otp",
        sms_enabled_countries: "/w/subscription/v1/country/sms",
        delete: "/w/iam/v1/user/delete",
        partner_redirect: "/w/iam/v1/payment/partner-redirect",
        list_offer: "/w/iam/v1/payment/offer/list",
        verify_offer: "/w/iam/v1/payment/offer/verify",
        apply_offer_status: "/w/iam/v1/payment/offer/apply",
        googleLogin: "/w/iam/v1/user/social/sign-in/google",
        appleLogin: "/w/iam/v1/user/social/sign-in/apple",
        tveLogin: "/w/iam/v1/tve/init",
        verifySocialTve: "/w/iam/v1/tve/session/verify",
        tveSessionStart: "/w/iam/v1/tve/session/start",
        verifySocialAuthCode: "/w/iam/v1/user/social/verify-code",
        tveSessionLogout: "/w/iam/v1/tve/logout",
        tvProviderAuth: "/w/iam/v1/tve/session/tv",
        tveResumeSession: "/w/iam/v1/tve/session/resume",
        logInScreenSettings: "/w/iam/v1/user/auth-settings/sign-in",
        signUpScreenSettings: "/w/iam/v1/user/auth-settings/sign-up",
        migrateFromWillow: "/w/iam/v1/user/migrate/willow-user",
        willowFAQ: "/w/static/v1/willow-faqs"
    },
    matchPartyChat: {
        chat_box: "/w/iam/v1/user/chat/get-chatbox",
        chat_guidelines: "/w/iam/v1/user/chat/guidelines",
    },
    websiteCbplus: {
        trending: "/w/home/v1/premiumIndex",
        videos: "/w/videos/v1/premiumIndex",
        editorials: "/w/news/v1/premiumIndex",
        videos_collection: "/w/videos/v1/collection/premiumIndex",
    },
    websiteIplAuction: {
        upcoming: "/w/auction/v1/players/upcoming",
        completed: "/w/auction/v1/players/completed",
        live: "/w/auction/v1/players/live",
        teams: "/w/auction/v1/teams",
        team: "/w/auction/v1/team/{teamId}",
        player: "/w/auction/v1/player/{playerId}",
        player_search: "/w/auction/v1/playerSearch?plrN={searchText}",
        faq: "/w/auction/v1/faq",
        ipl_year: "/w/auction/v1/seasons"
    },
    matchSpecialStories: {
        index: "/w/site-ads/v1/specialNews/index/{matchId}",
        detail: "/w/site-ads/v1/specialNews/detail/{specialSotryId}",
    },
    websiteFantasy: {
        index: "/w/fantasy/v1/index/{matchId}",
        player: "/w/fantasy/v1/playerInfo/{playerId}",
        venue: "/w/fantasy/v1/venueInfo/{matchId}?userState={userState}",
        all_players: "/w/fantasy/v1/allPlayers/{matchId}?userState={userState}",
        match_ups: "/w/fantasy/v1/matchUps/{matchId}?userState={userState}",
        expert_pick: "/w/fantasy/v1/expertPick/{matchId}?userState={userState}"
    },
    contact: {
        terms: "/w/static/v1/terms-of-use",
        privacy: "/w/static/v1/privacy-policy",
        copyright: "/w/static/v1/copyright",
        privacyChoices: "/w/static/v1/your-privacy-choices",
        videoViewingPolicy: "/w/static/v1/video-viewing-policy",
        policyTil: "/w/static/v1/privacy-policy-til",
        termsTil: "/w/static/v1/terms-of-use-til",
        aboutUs: "/i/static/v1/about-us",
        cookieSdkPolicy: "/w/static/v1/cookie-policy"
    },
    spConsent: {
        onSignIn: "/w/iam/v1/user/on-sign-in"
    },
    footerMenu: "/w/static/v1/app-info"
};
