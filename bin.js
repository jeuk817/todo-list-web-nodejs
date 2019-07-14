const app = require('./app');
// const port = 3000;
const port = process.env.PORT;
const hostName = '127.0.0.1';

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 대기중입니다.`);
})
