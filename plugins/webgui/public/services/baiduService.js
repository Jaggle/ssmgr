const app = angular.module('app');

app.factory('baiduApi', [() => {
  const doMyVendor = () => {
    (function () {
      let b = document.createElement("script");
      b.src = "https://hm.baidu.com/hm.js?8f601b0ce3cf3559051fbc73c6bccb9c";
      let a = document.getElementsByTagName("script")[0];
      a.parentNode.insertBefore(b, a)
    })();

    (function (m, ei, q, i, a, j, s) {
      m[i] = m[i] || function () {
            (m[i].a = m[i].a || []).push(arguments)
          };
      j = ei.createElement(q);
      s = ei.getElementsByTagName(q)[0];
      j.async = true;
      j.charset = 'UTF-8';
      j.src = 'https://static.meiqia.com/dist/meiqia.js?_=t';
      s.parentNode.insertBefore(j, s);
    })(window, document, 'script', '_MEIQIA');
    _MEIQIA('entId', 96478);
  };

  return { doMyVendor };
}]);