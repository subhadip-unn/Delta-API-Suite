<?

$config_api = new Phalcon\Config(array(
	'api'  => [
				'basepath' => 'apiprv.cricbuzz.com/',
                'fallbackpath' => 'apiprv-nginx.service.consul/',
				'home'		=> [
					'index'		=>	'w/home/v1/index',
					'miniscore' =>	'w/matches/v1/miniscorecard/{id}',
					'matches'	=>	'w/home/v1/matches',
				],
                'stats'     => [
					'rankings'   =>   'w/stats/v1/rankings/{category}?formatType={format}',
					'pointstable'   => 'w/stats/v1/iccstanding/team/matchtype/{matchTypeId}',
				],
                'series'      => [
					'featured'		   =>	'w/series/v1/featured',
                    'category'         =>   'w/series/v1/{category}',
					'info'			   =>	'w/series/v1/{id}/info',
                    'matches'          =>   'w/series/v1/{id}',
                    'squads'           =>   'w/series/v1/{id}/squads',
                    'venues'           =>   'w/series/v1/{id}/venues',
					'history'		   =>	'w/series/v1/{id}/season',
                    'pointstable'      =>   'w/stats/v1/series/{id}/points-table',
					'videos'           =>   'w/videos/v1/series/{id}',
					'news'             =>   'w/news/v1/series/{id}',
					'photos'		   =>	'w/photos/v1/series/{id}',
					'stats'			   =>	'w/stats/v1/series/{id}',
					'highlightslist'   =>   'w/stats/v1/highlights-list?',
					'wicket_zone'      =>	'w/stats/v1/wicket-zone?'

                ],
                'venues' => [
					'detail'    => 'w/venues/v1/{id}',
					'matches'   => 'w/venues/v1/{id}/matches',
					'stats'		=> 'w/stats/v1/venue/{id}'
                ],
                'teams'      => [
					'info'			   =>	'w/teams/v1/{id}/info',
					'news'             =>   'w/news/v1/team/{id}',
                    'list'             =>   'w/teams/v1/{category}',
					'videos'           =>   'w/videos/v1/team/{id}',
					'results'		   => 	'w/teams/v1/{id}/results',
					'schedule'		   => 	'w/teams/v1/{id}/schedule',
					'stats'			   =>   'w/stats/v1/team/{id}',
					'players'		   =>	'w/teams/v1/{id}/players',
					'photos'		   =>	'w/photos/v1/team/{id}'
                ],

                'images'    => [
                    'url' => '/a/img/v1/{mxn}/i1/c{id}/{imagename}.jpg'
                ],
                'videos' => [
					'all' =>  [
						'url' => 'w/videos/v1/collection/videoIndex',
						'ajax_url' => '?order='
					],
					'index' =>  'w/videos/v1/index',
					'suggested' =>  'w/videos/v1/sugg/{id}',
					'playlist' =>  'w/videos/v1/playlistdetail',
					'playlistDetail' =>  'w/videos/v1/playlist/{id}',
					'category' =>  'w/videos/v1/catdetail',
					'categoryDetail' =>  'w/videos/v1/collection/cat/{id}',
					'detail' => 'w/videos/v1/detail/',
					'collectionDetail' => 'w/videos/v1/collection/detail/{id}',
					'buzzDetail' =>'w/buzz/v1/get-item?itemType={buzzType}&itemID={buzzId}',
                ],
                'search' => [
                    'suggestions' => 'w/esearch/v1/sugg/',
                    'results' => 'w/esearch/v1/detail?q=',
                    'events' => 'w/esearch/v1/save',
                    'trending_players' => 'w/stats/v1/player/trending'
				],
				'topics' => [
					'all' => 'w/news/v1/topics',
					'details'  =>  [
						'url' => 'w/news/v1/topics/{id}',
						'ajax_url'        => 'w/news/v1/topics/{id}?lastId='
					],
				],
				'schedule' => [
					'upcoming' => [
						'international' => [
							'url'  => 'w/schedule/v1/international',
							'ajax_url'=> 'w/schedule/v1/international?lastTime='
						],
						'domestic' => [
							'url'  => 'w/schedule/v1/domestic',
							'ajax_url'=> 'w/schedule/v1/domestic?lastTime='
						],
						'league' => [
							'url'  => 'w/schedule/v1/league',
							'ajax_url'=> 'w/schedule/v1/league?lastTime='
						],
						'women' => [
							'url'  => 'w/schedule/v1/women',
							'ajax_url'=> 'w/schedule/v1/women?lastTime='
						],
						'all' => [
							'url'  => 'w/schedule/v1/all',
							'ajax_url'=> 'w/schedule/v1/all?lastTime='
						]
					]
				],
				'archives' => [
					'Domestic' => 'w/series/v1/archives/Domestic?year=',
					'International' => 'w/series/v1/archives/International?year=',
					'League' => 'w/series/v1/archives/league?year=',
					'Women' => 'w/series/v1/archives/women?year=',
				],
				'player'   => [
					'profile'  =>  'w/stats/v1/player/{id}',
					'bowling'  => 'w/stats/v1/player/{id}/bowling',
					'batting'  => 'w/stats/v1/player/{id}/batting',
					'career'   => 'w/stats/v1/player/{id}/career',
 					'bestranks' => 'w/stats/v1/player/{id}/bestranks'
				],
				'news' => [
					'all'   =>  [
							'url'             => 'w/news/v1/index',
							'ajax_url'        => '?lastId=',
							'show_story_type' => TRUE,
						],
					'detail'   =>  [
							'url'             => 'w/news/v1/detail/',
						],
					'news'   => [
							'url'             => 'w/news/v1/cat/1',
							'ajax_url'        => '?lastId=',
							'show_story_type' => FALSE,
						],
					'topics'   => [
							'url'               => 'w/news/v1/topics',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
						],
					'editors-pick' => [
							'url'               => "w/news/v1/cat/2",
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
						],
					'specials' => [
							'url'               => 'w/news/v1/cat/5',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
						],
					'stats'     =>  [
							'url'               => 'w/news/v1/cat/8',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
						],
					'interview'  => [
							'url'               => 'w/news/v1/cat/4',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
						],
					'matchstory'  => [
							'url'               => 'w/news/v1/cat/10',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
						],
					'editorial'    => [
							'url'               => 'w/news/v1/cat/3',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
						],
					'opinions'    => [
							'url'               => 'w/news/v1/cat/3',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
					],
					'match-reports'    => [
						'url'               => 'w/news/v1/cat/6',
						'ajax_url'          => '?lastId=',
						'show_story_type'   => FALSE,
					],
					'match-previews'    => [
						'url'               => 'w/news/v1/cat/7',
						'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
					],
					'tour-diaries'    => [
						'url'               => 'w/news/v1/cat/13',
						'ajax_url'          => '?lastId=',
						'show_story_type'   => FALSE,
					],
					'others'    => [
						'url'               => 'w/news/v1/cat/9',
						'ajax_url'          => '?lastId=',
						'show_story_type'   => FALSE,
					],
					'player'        => [
							'url'               => 'w/news/v1/player/',
							'ajax_url'          => '?lastId=',
							'show_story_type'   => FALSE,
					],
					'author'      => [
							'url'                => 'w/news/v1/authors/{id}/articles',
							'ajax_url'           => '?lastId=',
							'show_story_type'    => FALSE,
					],
					'author_info'      => [
							'url'       => 'w/news/v1/authors/{id}/info',
					],
					'editorial_list'    => [
						'url'               => 'w/news/v1/cat',
						'show_story_type'   => FALSE,
					],
					'expert'        => [
						'url'               => 'w/content/v1/experts/{id}',
						'ajax_url'          => '?pt=',
						'show_story_type'   => FALSE,
					],
					'featured'		=>	[
						'url'		=>	'w/news/v1/featured'
					],
					'premium-article'  =>	[
						'url'		=>	'w/news/v1/premiumIndex',
						'ajax_url'  => '?lastId=',
					],
				],
				'photos' => [
					'all'   => 'w/photos/v1/index',
					'detail'   => 'w/photos/v1/detail/'
				],
				'adverts' => [	
					'url'	=> 'w/site-ads/v1/{page_name}'
				],
				'match'	=> [
					'info'			=> 'w/mcenter/v1/{id}/info',
					'news'	 		=> 'w/news/v1/match/{id}', 
					'photos' 		=> 'w/photos/v1/match/{id}',
					'comm'			=> 'w/mcenter/v1/{id}/comm',
					'hcomm'			=> 'w/mcenter/v1/{id}/hcomm',
					'match_facts' 	=> 'w/mcenter/v1/{id}/info',
					'scorecard'		=> 'w/mcenter/v1/{id}/scard',
					'hscorecard'	=> 'w/mcenter/v1/{id}/hscard',
					'full_comm'		=> 'w/mcenter/v1/{id}/fcomm?iid=',
					'hfull_comm'	=> 'w/mcenter/v1/{id}/hfcomm?iid=',
					'highlights'	=> 'w/mcenter/v1/{id}/hlights?iid=',
					'hhighlights'	=> 'w/mcenter/v1/{id}/hhlights?iid=',
					'live_scores'	=> 'w/matches/v1/{matchCategory}',
					'current'		=> 'w/matches/v1/current',
					'videos'		=> 'w/snippets/v1/matchVideos?matchId={id}',
					'squads'		=> 'w/mcenter/v1/{id}/teams',
					'mini_scorecard'=> 'w/mcenter/v1/{id}/miniscorecard',
					'live_feed'		=> 'w/videos/v1/matchStream/{id}',
					'player_highligts'  => 'w/mcenter/v1/{id}/fcomm?iid={iid}&playerId={playerId}&type={type}',
					'hplayer_highligts'  => 'w/mcenter/v1/{id}/hfcomm?iid={iid}&playerId={playerId}&type={type}',
					'match_overs'	=> 'v/mcenter/v1/{id}/overs',
					'have_your_say' => 'b/admin/v1/userFeedback/upsert'
				],
				'seo' => [
					'site_details'   => 'w/meta/v1/sitedetails/all',
					'page_details' => 'w/meta/v1/pagedetails/getOne/{page_name}',
					'robots'   => 'w/seo/v1/robots/all'
				],
				'quiz' => [
					'index'   => 'w/quizzes/v1/index',
					'detail' => 'w/quizzes/v1/details/',
				],
				'specials' => [
					'boostometer'   =>  [
						'apiBasePath' => 'live-feeds.service.consul',
						'tournament_index' => '/cricbuzz/ads/demo/campaign/boostometer/tournament-index.json?',
						'match_index'      => '/cricbuzz/ads/demo/campaign/boostometer/match-index.json?',
						'all_time'      => '/cricbuzz/ads/demo/campaign/boostometer/allTime.json?'
					],
					'special_content' =>[
						'series_list' => 'w/news/v1/advertorials/index?seriesId={id}',
						'series_match' => 'w/news/v1/advertorials/index?matchId={id}',
					]
				],
				'subscription' => [
					'cbplus_faqs'			=> 'w/static/v1/cb-plus-terms',
					'plans'					=> 'w/subscription/v1/plandetail',
					'plan_term_detail' 		=> 'w/subscription/v1/plantermdetail',
					'feedback' 				=> 'w/subscription/v1/lists/feedback',
					'cancel_subscription' 	=> 'w/subscription/v1/lists/cancel',
				],
				'cricbuzzPlusAuth' => [
					'sign_up'			=> 'w/iam/v1/user/sign-up',
					'sign_up_mobile'	=> 'w/iam/v1/user/update-phone-number',
					'login'				=> 'w/iam/v1/user/sign-in',
					'logout'			=> 'w/iam/v1/user/sign-out',
					'verify'			=> 'w/iam/v1/user/verify-otp',
					"verify_mobile"		=> 'w/iam/v1/user/update-verify-otp',
					'verify_token'		=> 'w/iam/v1/user/verify-token',
					'refresh_token'		=> 'w/iam/v1/user/refresh-token',
					'tve_refresh_token'	=> 'w/iam/v1/tve/refresh-token',
					'tve_profiles_code' => 'w/iam/v1/tve/profiles/code',
					'tve_redirection_url'=> 't/iam/v1/tve/session/tv/',
					'update'			=> 'w/iam/v1/user/update',
					'google_login'		=> 'w/iam/v1/user/google/sign-in',
					'google_callback'	=> 'w/iam/v1/user/google/callback?code={calback_code}',
					'payment'			=> 'w/iam/v1/payment/pay',
					'payment_callback'	=> 'w/iam/v1/payment/callback/payment',
					'payment_widget'	=> 'w/iam/v1/payment/widget/{userId}',
					'transactions'		=> 'w/iam/v1/payment/transaction',
					'cancel'			=> 'w/iam/v1/payment/cancel',
					'coupons_list'		=> 'w/iam/v1/user/coupons/list',
					'redeem_coupon'		=> 'w/iam/v1/user/coupons/redeem',
					'coupon_code'		=> 'w/iam/v1/user/coupons',
					'support_request'	=> 'w/notify/v1/webfeedback',
					'contactUs_request' => 'w/notify/v1/webcontact',
					'Advertise_request' => 'w/notify/v1/advertise',
					'career_request'	=> 'w/notify/v1/career',
					'career_list'     	=> 'w/career/v1/Index',
					'career_detail'		=> 'w/career/v1/Detail/id',
					'deals'				=> 'w/iam/v1/user/coupons/deals',
					'unlock'			=> 'w/iam/v1/user/coupons/unlock',
					'verify_access'		=> 'w/iam/v1/user/verify-access',
					'get_client_otp'	=> 'f/iam/v1/timwe/get-number',
					'verify_client_otp' => 'f/iam/v1/timwe/verify-otp',
					'sms_enabled_countries' => 'w/subscription/v1/country/sms',
					'delete'			=> 'w/iam/v1/user/delete',
					'partner_redirect'	=> 'w/iam/v1/payment/partner-redirect',
					'list_offer'        => 'w/iam/v1/payment/offer/list',
					'verify_offer'		 => 'w/iam/v1/payment/offer/verify',
				 	'apply_offer_status' => 'w/iam/v1/payment/offer/apply',
					'googleLogin'		 => 'w/iam/v1/user/social/sign-in/google',
					'appleLogin'		 => 'w/iam/v1/user/social/sign-in/apple',
					'tveLogin'           => 'w/iam/v1/tve/init',
					'verifySocialTve'    => 'w/iam/v1/tve/session/verify',
					'tveSessionStart'    => 'w/iam/v1/tve/session/start',
					'verifySocialAuthCode' 	=> 'w/iam/v1/user/social/verify-code',
					'tveSessionLogout'		=> 'w/iam/v1/tve/logout',
					'tvProviderAuth'		=> 'w/iam/v1/tve/session/tv',
					'tveResumeSession'		=> 'w/iam/v1/tve/session/resume',
					'logInScreenSettings'	=> 'w/iam/v1/user/auth-settings/sign-in',
					'signUpScreenSettings'	=> 'w/iam/v1/user/auth-settings/sign-up',
					'migrateFromWillow'		=> 'w/iam/v1/user/migrate/willow-user',
					"willowFAQ"			=> 'w/static/v1/willow-faqs'
				],
				'matchPartyChat' => [
					'chat_box'			=> 'w/iam/v1/user/chat/get-chatbox',
					'chat_guidelines'	=> 'w/iam/v1/user/chat/guidelines',
				],
				'cbplus' => [
					'trending'			=> 'w/home/v1/premiumIndex',
					'videos'			=> 'w/videos/v1/premiumIndex',
					'editorials'		=> 'w/news/v1/premiumIndex',
					'videos_collection' => 'w/videos/v1/collection/premiumIndex',
				],
				'iplAuction' => [
					'upcoming'			=> 'w/auction/v1/players/upcoming',
					'completed'			=> 'w/auction/v1/players/completed',
					'live'				=> 'w/auction/v1/players/live',
					'teams'				=> 'w/auction/v1/teams',
					'team'				=> 'w/auction/v1/team/{teamId}',
					'player'			=> 'w/auction/v1/player/{playerId}',
					'player_search'		=> 'w/auction/v1/playerSearch?plrN={searchText}',
					'faq'				=> 'w/auction/v1/faq',
					'ipl_year' 			=> 'w/auction/v1/seasons'
				],
				'matchSpecialStories' => [
					'index'			=> 'w/site-ads/v1/specialNews/index/{matchId}',
					'detail'	=> 'w/site-ads/v1/specialNews/detail/{specialSotryId}',
				],
				'fantasy' => [
					'index'	    			=> 'w/fantasy/v1/index/{matchId}',
					'player'				=> 'w/fantasy/v1/playerInfo/{playerId}',
					'venue'					=> 'w/fantasy/v1/venueInfo/{matchId}?userState={userState}',
					'all_players'			=> 'w/fantasy/v1/allPlayers/{matchId}?userState={userState}',
					'match_ups'	    		=> 'w/fantasy/v1/matchUps/{matchId}?userState={userState}',
					'expert_pick'	    	=> 'w/fantasy/v1/expertPick/{matchId}?userState={userState}'
				],
				'contact' => [
					'terms' => 'w/static/v1/terms-of-use',
					'privacy' => 'w/static/v1/privacy-policy',
					'copyright' => 'w/static/v1/copyright',
					'privacyChoices' => 'w/static/v1/your-privacy-choices',
					'videoViewingPolicy' => 'w/static/v1/video-viewing-policy',
					'policyTil' => "w/static/v1/privacy-policy-til",
					'termsTil' => "w/static/v1/terms-of-use-til",
					'aboutUs'=> "i/static/v1/about-us",
					'cookieSdkPolicy' => 'w/static/v1/cookie-policy'

				],
				'spConsent' =>[
					'onSignIn' =>'w/iam/v1/user/on-sign-in'
				],

				'footerMenu' => 'w/static/v1/app-info'
			]
 ));
?>
