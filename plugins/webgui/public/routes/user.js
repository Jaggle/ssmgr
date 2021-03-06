const app = angular.module('app');
const window = require('window');
const cdn = window.cdn || '';

app.config(['$stateProvider', $stateProvider => {
  $stateProvider
    .state('user', {
      url: '/user',
      abstract: true,
      templateUrl: `${ cdn }/public/views/user/user.html`,
    })
    .state('user.index', {
      url: '/index',
      controller: 'UserIndexController',
      templateUrl: `${ cdn }/public/views/user/index.html`,
    })
    .state('user.account', {
      url: '/account',
      controller: 'UserAccountController',
      templateUrl: `${ cdn }/public/views/user/account.html`,
    })
    .state('user.changePassword', {
      url: '/changePassword',
      controller: 'UserChangePasswordController',
      templateUrl: `${ cdn }/public/views/user/changePassword.html`,
    })
    .state('user.faq', {
      url: '/faq',
      controller: 'UserFaqController',
      templateUrl: `${ cdn }/public/views/user/faq.html`,
      })
    .state('user.buy', {
      url: '/buy',
      controller: 'UserBuyController',
      templateUrl: `${ cdn }/public/views/user/buy.html`
    })
    .state('user.invite', {
      url: '/invite',
      controller: 'UserInviteController',
      templateUrl: `${ cdn }/public/views/user/invite.html`
    })
  ;
  }])
;
