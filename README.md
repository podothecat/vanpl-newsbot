# vanpl-newsbot

lambda에 다음 환경변수 셋업 필요

- BOT_TOKEN
https://api.slack.com/apps/A05MBHVTBUH/oauth? 에서 Bot User OAuth Token을 가져온다

- SOURCE_CHANNEL (기본값: __bot_rss_receive)
RSS 원본 뉴스 리스트가 포스팅되는 채널명

- TARGET_CHANNEL (기본값: bottest)
뉴스 요약을 포스팅할 채널

- FILTER_HEADLINE_BY_KEYWORD (기본값: true)
헤드라인에 키워드가 들어가있어야만 보여주는지의 여부