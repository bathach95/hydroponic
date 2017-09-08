service.service('UserManagementService', function($http){
    this.getAllUser = function(){
        return $http.get('/user/all');
    }

    this.deleteUser = function(userId){
        return $http.delete('/user/delete', {
            params: userId
        })
    }

    this.getUserDetail = function(userId){
        return $http.get('/user/detail', {
            params: userId
        })
    }

    this.updateRole = function(user){
        return $http.put('/user/updaterole', user);
    }
})