const app = getApp();

const request = (url, options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${app.globalData.host}${url}`,
      method: options.method,
      data: options.method === 'GET' ? options.data : JSON.stringify(options.data),
      header: {
        'Content-Type': 'application/json; charset=UTF-8',
        'x-token': 'x-token' // 看自己是否需要
      },

      success(request) {
        resolve(request.data); //  if (request.data.code === 2000) {
        //      resolve(request.data)
        //  } else {
        //      reject(request.data)
        //  }
      },

      fail(error) {
        reject(error.data);
      }

    });
  });
};

const get = (url, options = {}) => {
  return request(url, {
    method: 'GET',
    data: options
  });
};

const post = (url, options) => {
  return request(url, {
    method: 'POST',
    data: options
  });
};

const put = (url, options) => {
  return request(url, {
    method: 'PUT',
    data: options
  });
};

const remove = (url, options) => {
  return request(url, {
    method: 'DELETE',
    data: options
  });
};

module.exports = {
  get,
  post,
  put,
  remove
};