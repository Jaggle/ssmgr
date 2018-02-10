const app = angular.module('app');

app
  .controller('HomeController', ['$scope', '$mdMedia', '$mdSidenav', '$state', '$http', '$timeout', '$localStorage',
    ($scope, $mdMedia, $mdSidenav, $state, $http, $timeout, $localStorage) => {
      if ($localStorage.home.status === 'normal') {
        $state.go('user.index');
      } else if ($localStorage.home.status === 'admin') {
        $state.go('admin.index');
      } else {
        $localStorage.admin = {};
        $localStorage.user = {};
        $scope.setMainLoading(false);
      }
      $scope.innerSideNav = true;
      $scope.menuButton = function() {
        if ($mdMedia('gt-sm')) {
          $scope.innerSideNav = !$scope.innerSideNav;
        } else {
          $mdSidenav('left').toggle();
        }
      };
      $scope.menus = [{
        name: '首页',
        icon: 'home',
        click: 'home.index'
      }, {
        name: '登录',
        icon: 'cloud',
        click: 'home.login'
      }, {
        name: '注册',
        icon: 'face',
        click: 'home.signup'
      }];
      $scope.menuClick = (index) => {
        $mdSidenav('left').close();
        $state.go($scope.menus[index].click);
      };
    }
  ])
  .controller('HomeIndexController', ['$scope', '$state', 'baiduApi',
    ($scope, $state, baiduApi) => {
      $scope.icons = [{
        icon: 'flash_on',
        title: '富强民主，文明和谐',
        content: '',
      }, {
        icon: 'build',
        title: '自由平等，公正法治',
        content: '',
      }, {
        icon: 'vpn_key',
        title: '爱国敬业，诚信友善',
        content: '',
      }];
      $scope.login = () => { $state.go('home.login'); };
      $scope.signup = () => { $state.go('home.signup'); };

      baiduApi.doMyVendor();
    }
  ])
  .controller('HomeLoginController', ['$scope', '$state', 'homeApi', 'alertDialog', '$localStorage',
    ($scope, $state, homeApi, alertDialog, $localStorage) => {
      $scope.user = {};
      $scope.login = () => {
        alertDialog.loading().then(() => {
          return homeApi.userLogin($scope.user.email, $scope.user.password);
        }).then(success => {
          $localStorage.home.status = success;
          return alertDialog.close().then(() => {
            return success;
          });
        }).then(success => {
          if (success === 'normal') {
            $state.go('user.index');
          } else if (success === 'admin') {
            $state.go('admin.index');
          }
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
      $scope.findPassword = () => {
        alertDialog.loading().then(() => {
          return homeApi.findPassword($scope.user.email);
        })
        .then(success => {
          alertDialog.show(success, '确定');
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
      $scope.enterKey = key => {
        if(key.keyCode === 13) {
          $scope.login();
        }
      };
    }
  ])
  .controller('HomePriceController', ['$scope',
    ($scope) => {
     // $scope.setTitle('价格');
    }
  ])
  .controller('HomeSignupController', ['$scope', '$state', '$interval', '$timeout', 'homeApi', 'alertDialog',
    ($scope, $state, $interval, $timeout, homeApi, alertDialog) => {
      $scope.user = {};
      $scope.sendCodeTime = 0;
      $scope.sendCode = () => {
        alertDialog.loading().then(() => {
          return homeApi.sendCode($scope.user.email);
        })
        .then(success => {
          alertDialog.show('验证码已发至邮箱', '确定');
          $scope.sendCodeTime = 120;
          const interval = $interval(() => {
            if ($scope.sendCodeTime > 0) {
              $scope.sendCodeTime--;
            } else {
              $interval.cancel(interval);
              $scope.sendCodeTime = 0;
            }
          }, 1000);
        }).catch(err => {
          if (err.indexOf('belongs to u') >= 0) {
            alertDialog.show(err, '确定');
            setTimeout(function () {
              window.location.href="https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E5%A6%82%E4%BD%95%E5%81%9A%E4%B8%80%E4%B8%AA%E5%90%88%E6%B3%95%E7%9A%84%E5%85%AC%E6%B0%91&oq=%25E5%25A6%2582%25E4%25BD%2595%25E5%2581%259A%25E4%25B8%2580%25E4%25B8%25AA%25E5%2590%2588%25E6%25B3%2595%25E7%259A%2584%25E4%25B8%25AD%25E5%259B%25BD%25E5%2585%25AC%25E6%25B0%2591&rsv_pq=9e233c710001a8d6&rsv_t=c19drKZI2PENKAep9kH7kZ6grZi60yjoaAv274arsAUugB2i9wPryyI0cFc&rqlang=cn&rsv_enter=1&rsv_sug3=5&rsv_sug1=3&rsv_sug7=000&rsv_sug2=0&inputT=524&rsv_sug4=3485&rsv_sug=1";
            },5000);
          } else {
            alertDialog.show(err, '确定');
          }
        });
      };
      $scope.signup = () => {
        alertDialog.loading().then(() => {
          return homeApi.userSignup($scope.user.email, $scope.user.code, $scope.user.password);
        })
        .then(success => {
          alertDialog.show('用户注册成功', '确定').then(success => {
            $state.go('home.login');
          });
        }).catch(err => {
          alertDialog.show(err, '确定');
        });
      };
    }
  ])
  .controller('HomeResetPasswordController', ['$scope', '$http', '$state', '$stateParams', 'alertDialog',
    ($scope, $http, $state, $stateParams, alertDialog) => {
      $scope.user = {};
      const token = $stateParams.token;
      alertDialog.loading().then(() => {
        return $http.get('/api/home/password/reset', {
          params: {
            token
          },
        });
      }).then(() => {
        return alertDialog.close();
      }).catch(() => {
        alertDialog.show('该链接已经失效', '确定').then(() => {
          $state.go('home.index');
        });
      });
      $scope.resetPassword = () => {
        alertDialog.loading();
        $http.post('/api/home/password/reset', {
          token,
          password: $scope.user.password,
        }).then(() => {
          alertDialog.show('修改密码成功', '确定').then(() => {
            $state.go('home.login');
          });
        }).catch(() => {
          alertDialog.show('修改密码失败', '确定');
        });
      };
    }
  ])
  .controller('HomeMacLoginController', ['$scope', '$http', '$state', '$stateParams', '$localStorage',
  ($scope, $http, $state, $stateParams, $localStorage) => {
    const mac = $stateParams.mac;
    $http.post('/api/home/macLogin', {
      mac,
    }).then(() => {
      $localStorage.home.status = 'normal';
      $state.go('user.index');
    }).catch(() => {
      $state.go('home.index');
    });
  }
])
;
