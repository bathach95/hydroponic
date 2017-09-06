controller.controller('AdminCtrl', function ($scope) {

});

controller.controller('ModCtrl', function ($scope) {

});

controller.controller('UserManagementCtrl', function ($scope, UserManagementService, flash) {
    UserManagementService.getAllUser().then(function (result) {
        if (result.data.success) {
            $scope.listUser = result.data.data;
        }
    })

    $scope.delete = function (index, userId) {
        bootbox.confirm('Do you want to delete this user ?', function () {
            UserManagementService.deleteUser({userId: userId}).then(function(result){
                if(result.data.success){
                    $scope.listUser.splice(index, 1);
                    flash.success = result.data.message;
                } else {
                    flash.error = result.data.message;
                }
            })

        })
    }
})