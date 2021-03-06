const app = angular.module('app');

app
.controller('UserController', ['$scope', '$mdMedia', '$mdSidenav', '$state', '$http', '$interval', '$localStorage', 'userApi',
  ($scope, $mdMedia, $mdSidenav, $state, $http, $interval, $localStorage, userApi) => {
    if ($localStorage.home.status !== 'normal') {
      $state.go('home.index');
    } else {
      $scope.setMainLoading(false);
    }
    $scope.innerSideNav = true;
    $scope.sideNavWidth = () => {
      if($scope.innerSideNav) {
        return {
          width: '200px',
        };
      } else {
        return {
          width: '60px',
        };
      }
    };
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
        click: 'user.index'
    }, {
        name: '账号',
        icon: 'account_circle',
        click: 'user.account'
    }, {
        name: '购买',
        icon: 'attach_money',
        click: 'user.buy'
    }, {
       name: '推广',
       icon: 'accessibility',
       click: 'user.invite'
    }, {
        name: '设置',
        icon: 'settings',
        click: 'user.changePassword'
    }, {
        name: 'divider',
    }, {
        name: '使用教程',
        icon: 'cloud',
        click: 'user.faq'
    }, {
      name: '退出',
      icon: 'exit_to_app',
      click: function() {
        $http.post('/api/home/logout').then(() => {
          $localStorage.home = {};
          $localStorage.user = {};
          $state.go('home.index');
        });
      },
    }];
    $scope.menuClick = (index) => {
      $mdSidenav('left').close();
      if(typeof $scope.menus[index].click === 'function') {
        $scope.menus[index].click();
      } else {
        $state.go($scope.menus[index].click);
      }
    };
    $scope.title = '';
    $scope.setTitle = str => { $scope.title = str; };
    $scope.interval = null;
    $scope.setInterval = interval => {
      $scope.interval = interval;
    };
    $scope.$on('$stateChangeStart', function(event, toUrl, fromUrl) {
      $scope.title = '';
      $scope.interval && $interval.cancel($scope.interval);
    });

    if(!$localStorage.user.serverInfo && !$localStorage.user.accountInfo) {
      userApi.getUserAccount().then(success => {
        $localStorage.user.serverInfo = {
          data: success.servers,
          time: Date.now(),
        };
        $localStorage.user.accountInfo = {
          data: success.account,
          time: Date.now(),
        };
      });
    };
  }
])
.controller('UserIndexController', ['$scope', '$state', '$http','userApi', 'markdownDialog', 'confirmDialog', 'alertDialog', '$localStorage',
  ($scope, $state, $http, userApi, markdownDialog, confirmDialog, alertDialog, $localStorage) => {
    $scope.setTitle('首页');
    // $scope.notices = [];
    userApi.getNotice().then(success => {
      $scope.notices = success;
    });
    $scope.toMyAccount = () => {
      $state.go('user.account');
    };
    $scope.showNotice = notice => {
      markdownDialog.show(notice.title, notice.content);
    };

    const getUserAccountInfo = () => {
        userApi.getUserAccount().then(success => {
            $scope.account = success.account[0].data;
            $scope.user = success.account[0];
        });
    };
    getUserAccountInfo();

    if  (!$localStorage.nextTip) {
      $localStorage.nextTip = 0;
    }

    const tip1 = () => {
      confirmDialog.show({
        text: '目前Greentern只能通过邀请的方式注册，如果你想分享给朋友，请务必给ta你的邀请链接',
        cancel: '取消',
        confirm: '查看我的邀请链接',
        error: '操作失败',
        fn: function () { return $http.get('/ping'); },
      }).then(() => {
        $state.go('user.invite');
      });
    };
    const tip2 = () => {
      alertDialog.show('每个节点的加密方式可能不一样，请仔细检查', '知道了');
    };
    const tip3 = () => {
      alertDialog.show("如果帐号快要过期，请至少提前一天续费，\n否则续费后可能会导致帐号无法正常使用的情况", '知道了');
    };

    const tips = [tip1, tip2, tip3];
    const showTip = tips[$localStorage.nextTip++];
    showTip();
    if ($localStorage.nextTip >= 3) {
      $localStorage.nextTip = 0;
    }

    $scope.fontColor = (time) => {
        if(time >= Date.now()) {
            return {
                color: '#333',
            };
        }
        return {
            color: '#a33',
        };
    };
  }
])
.controller('UserAccountController', ['$scope', '$http', '$mdMedia', 'userApi', 'alertDialog', 'payDialog', 'qrcodeDialog', '$interval', '$localStorage', 'changePasswordDialog',
  ($scope, $http, $mdMedia, userApi, alertDialog, payDialog, qrcodeDialog, $interval, $localStorage, changePasswordDialog) => {
    $scope.setTitle('账号');
    $scope.flexGtSm = 100;
    if(!$localStorage.user.serverInfo) {
      $localStorage.user.serverInfo = {
        time: Date.now(),
        data: [],
      };
    }
    $scope.servers = $localStorage.user.serverInfo.data;
    if(!$localStorage.user.accountInfo) {
      $localStorage.user.accountInfo = {
        time: Date.now(),
        data: [],
      };
    }
    $scope.account = $localStorage.user.accountInfo.data;
    if($scope.account.length >= 2) {
      $scope.flexGtSm = 50;
    }

    $http.get('/api/user/multiServerFlow').then(success => {
      $scope.isMultiServerFlow = success.data.status;
    });
    
    const setAccountServerList = (account, server) => {
      account.forEach(a => {
        a.serverList = $scope.servers.filter(f => {
          return !a.server || a.server.indexOf(f.id) >= 0;
        });
      });
    };
    setAccountServerList($scope.account, $scope.servers);

    const getUserAccountInfo = () => {
      userApi.getUserAccount().then(success => {
        $scope.servers = success.servers;
        if(success.account.map(m => m.id).join('') === $scope.account.map(m => m.id).join('')) {
          success.account.forEach((a, index) => {
            $scope.account[index].data = a.data;
            $scope.account[index].password = a.password;
            $scope.account[index].port = a.port;
            $scope.account[index].type = a.type;
          });
        } else {
          $scope.account = success.account;
        }
        setAccountServerList($scope.account, $scope.servers);
        $localStorage.user.serverInfo.data = success.servers;
        $localStorage.user.serverInfo.time = Date.now();
        $localStorage.user.accountInfo.data = success.account;
        $localStorage.user.accountInfo.time = Date.now();
        if($scope.account.length >= 2) {
          $scope.flexGtSm = 50;
        }
      });
    };
    getUserAccountInfo();

    $scope.email = $localStorage.user.accountInfo.data[0].user;

    const base64Encode = str => {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
      }));
    };
    $scope.createQrCode = (method, password, host, port, serverName) => {
      return 'ss://' + base64Encode(method + ':' + password + '@' + host + ':' + port);
    };

    $scope.getServerPortData = (account, serverId, port) => {
      account.currentServerId = serverId;
      const scale = $scope.servers.filter(f => f.id === serverId)[0].scale;
      if(!account.isFlowOutOfLimit) { account.isFlowOutOfLimit = {}; }
      userApi.getServerPortData(account, serverId, port).then(success => {
        account.lastConnect = success.lastConnect;
        account.serverPortFlow = success.flow;
        let maxFlow = 0;
        if(account.data) {
          maxFlow = account.data.flow * ($scope.isMultiServerFlow ? 1 : scale);
        }
        account.isFlowOutOfLimit[serverId] = maxFlow ? ( account.serverPortFlow >= maxFlow ) : false;
      });
    };

    $scope.$on('visibilitychange', (event, status) => {
      if(status === 'visible') {
        if($localStorage.user.accountInfo && Date.now() - $localStorage.user.accountInfo.time >= 10 * 1000) {
          $scope.account.forEach(a => {
            $scope.getServerPortData(a, a.currentServerId, a.port);
          });
        }
      }
    });
    $scope.setInterval($interval(() => {
      if($scope.account) {
        userApi.updateAccount($scope.account)
        .then(() => {
          setAccountServerList($scope.account, $scope.servers);
        });
      }
      $scope.account.forEach(a => {
        const currentServerId = a.currentServerId;
        userApi.getServerPortData(a, a.currentServerId, a.port).then(success => {
          if(currentServerId !== a.currentServerId) { return; }
          a.lastConnect = success.lastConnect;
          a.serverPortFlow = success.flow;
        });
      });
    }, 60 * 1000));

    $scope.getQrCodeSize = () => {
      if($mdMedia('xs')) {
        return 230;
      }
      return 180;
    };
    $scope.showChangePasswordDialog = (accountId, password) => {
      changePasswordDialog.show(accountId, password).then(() => {
        getUserAccountInfo();
      });
    };
    $scope.createOrder = (accountId) => {
      payDialog.chooseOrderType(accountId);
    };
    $scope.fontColor = (time) => {
      if(time >= Date.now()) {
        return {
          color: '#333',
        };
      }
      return {
        color: '#a33',
      };
    };
    $scope.isAccountOutOfDate = account => {
      if(account.type >=2 && account.type <= 5) {
        return Date.now() >= account.data.expire;
      } else {
        return false;
      }
    };
    $scope.showQrcodeDialog = (method, password, host, port, serverName) => {
      const ssAddress = $scope.createQrCode(method, password, host, port, serverName);
      qrcodeDialog.show(serverName, ssAddress);
    };
    $scope.cycleStyle = account => {
      let percent = 0;
      if(account.type !== 1) {
        percent = ((Date.now() - account.data.from) / (account.data.to - account.data.from) * 100).toFixed(0);
      }
      if(percent > 100) {
        percent = 100;
      }
      return {
        background: `linear-gradient(90deg, rgba(0,0,0,0.12) ${ percent }%, rgba(0,0,0,0) 0%)`
      };
    };
  }
])
.controller('UserChangePasswordController', ['$scope', '$state', 'userApi', 'alertDialog', '$http', '$localStorage',
  ($scope, $state, userApi, alertDialog, $http, $localStorage) => {
    $scope.setTitle('设置');
    $scope.data = {
      password: '',
      newPassword: '',
      newPasswordAgain: '',
    };
    $scope.confirm = () => {
      alertDialog.loading();
      userApi.changePassword($scope.data.password, $scope.data.newPassword).then(success => {
        alertDialog.show('修改密码成功，请重新登录', '确定')
        .then(() => {
          return $http.post('/api/home/logout');
        }).then(() => {
          $localStorage.home = {};
          $localStorage.user = {};
          $state.go('home.index');
        });
      }).catch(err => {
        alertDialog.show('修改密码失败', '确定');
      });
    };
  }
])
.controller('UserFaqController', ['$scope', ($scope) => { $scope.setTitle('使用教程'); }])
.controller('UserBuyController', ['$scope', 'confirmDialog', '$http', 'alertDialog', 'buyDialog', ($scope, confirmDialog, $http, alertDialog, buyDialog) => {
  $scope.setTitle('购买');
  $scope.currentPrice = null;
  $scope.products = [
      {title: '3个月/23元', price: 23},
      {title: '半年/45元', price: 45},
      {title: '一年/81元', price: 81},
  ];
  $scope.checkCurrent = (price) => {
    if ($scope.currentPrice === price) {
      return {
          border: '2px solid green'
      }
    }
  };
  $scope.checkProduct = (price) => {
    $scope.currentPrice = price;
  };
  $scope.buyAlert = () => {
    if (!$scope.currentPrice) {
      alertDialog.show('请先选择价格', '知道了');
      return false;
    }
    confirmDialog.show({
      text: "支付时请务必在支付说明/备注里写明自己的注册邮箱",
      cancel: '再考虑一下',
      confirm: '前往支付',
      error: '操作失败',
      fn: function () { return $http.post('/api/user/order/create', {
        price: $scope.currentPrice
      }); },
    }).then(() => {
      buyDialog.show($scope.currentPrice);
    });
  };
}])
.controller('UserInviteController', ['$scope', '$http', ($scope, $http) => {
  $scope.setTitle('推广');

  $http.get('/api/user/invite').then(success => {
    $scope.inviteInfo = success;
    $scope.records = success.data.records;
  });
}]);
