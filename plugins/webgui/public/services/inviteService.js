const app = angular.module('app');

app.factory('inviteApi', ['$q', '$http', ($q, $http) => {
    const getUserInviteInfo = (port) => {
        $http.post('/api/user/invite-info', { port }).then(success => {
            return success
        }).catch(err => {
            return Promise.reject('网络异常，请稍后再试');
        })
    };

    return {
        getUserInviteInfo
    }
}]);