service.service('UserManagementService', function($http){
    this.getAllUser = function(){
        return $http.get('/user/all');
    }

    this.deleteUser = function(userId){
        return $http.delete('/user/delete', {
            params: userId
        })
    }
})