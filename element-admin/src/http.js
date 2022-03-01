import axios from 'axios'
//服务端域名
const http = axios.create({
    baseURL:'https://www123456789.qicp.vip/api/admin'
})

export default http
