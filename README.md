# **discord-backup**

## 설명

이 레포지토리를 이용해 서버 백업 봇을 만들 수 있습니다.

사용시 서버의 모든 채널 정보와 카테고리 정보를 저장하고, 채널이 삭제되었을 때 복구할 수 있습니다.

## 구동 방법

### Windows
1. [Node.js](https://nodejs.org/en/) 를 설치합니다.(npm 포함)
1. 레포지토리를 다운로드하고 레포지토리 경로에서 `npm i`를 입력합니다.
1. setting.json을 추가하고 내용을 작성합니다.([setting.example.json](https://github.com/wjdgustn/discord-backup/blob/master/setting.example.json) 참고)
1. 레포지토리 경로에서 `node main.js`를 입력해 서버를 시작합니다.
1. 봇이 작동합니다!