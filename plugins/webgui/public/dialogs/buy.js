const app = angular.module('app');
const window = require('window');
const cdn = window.cdn || '';

app.factory('buyDialog', [ '$mdDialog', '$state', '$http', 'alertDialog', ($mdDialog, $state, $http, alertDialog) => {
  const publicInfo = {};
  const hide = () => {
    return $mdDialog.hide()
    .then(success => {
      dialogPromise = null;
      return;
    }).catch(err => {
      dialogPromise = null;
      return;
    });
  };
  const paid = () => {
    return $mdDialog.hide()
        .then(success => {
          return alertDialog.show('支付后3分钟左右订单会被处理，并发送您一封邮件，请查收', '知道了').then(() => {
            dialogPromise = null;
            return;
          });
        }).catch(err => {
          dialogPromise = null;
          return;
        });
  };
  publicInfo.hide = hide;
  publicInfo.paid = paid;
  const buy = (price) => {
    load();
    $http.post(`/api/admin/user/${ publicInfo.userId }/createOrder`, {
      price
    }).then(success => {
      hide();
    }).catch(() => {
      publicInfo.isLoading = false;
    });
  };
  publicInfo.buy = buy;
  let dialogPromise = null;
  const isDialogShow = () => {
    if(dialogPromise && !dialogPromise.$$state.status) {
      return true;
    }
    return false;
  };
  const dialog = {
    templateUrl: `${ cdn }/public/views/dialog/buy.html`,
    escapeToClose: false,
    locals: { bind: publicInfo },
    bindToController: true,
    controller: ['$scope', '$mdMedia', '$mdDialog', '$http', '$localStorage', 'bind', function($scope, $mdMedia, $mdDialog, $http, $localStorage, bind) {
      $scope.publicInfo = bind;
      if(!$localStorage.admin.createOrderData) {
        $localStorage.admin.createOrderData = {
          price: ''
        };
      }
      $scope.publicInfo.order = $localStorage.admin.createOrderData;
      $scope.setDialogWidth = () => {
        if($mdMedia('xs') || $mdMedia('sm')) {
          return {};
        }
        return { 'min-width': '400px' };
      };
    }],
    fullscreen: true,
    clickOutsideToClose: false,
  };
  const load = () => {
    publicInfo.isLoading = true;
  };
  const show = price => {
    publicInfo.isLoading = false;
    publicInfo.price = price;
    if(isDialogShow()) {
      return dialogPromise;
    }
    publicInfo.userId = 0;
    dialogPromise = $mdDialog.show(dialog);
    return dialogPromise;
  };
  return {
    show,
  };
}]);