controller.controller('AdminCtrl', function ($scope) {

});

controller.controller('ModCtrl', function ($scope) {

});

controller.controller('UserManagementCtrl', function ($scope, UserManagementService, flash, $state) {
    UserManagementService.getAllUser().then(function (result) {
        if (result.data.success) {
            $scope.listUser = result.data.data;

            $scope.dataTableOpt = {
             //custom datatable options
            // or load data through ajax call also
            "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50,'All']],
            };
        }
    })

    $scope.delete = function (index, userId) {
        bootbox.confirm('Do you want to delete this user ?', function (yes) {
            if (yes) {
                UserManagementService.deleteUser({ userId: userId }).then(function (result) {
                    if (result.data.success) {
                        $scope.listUser.splice(index, 1);
                        $state.reload();
                        flash.success = result.data.message;
                    } else {
                        flash.error = result.data.message;
                    }
                })

            }

        })
    }
})

controller.controller('UpdateRoleCtrl', function($scope, $state, $stateParams, UserManagementService, flash){
    /* get user info */
    UserManagementService.getUserDetail({userId: $stateParams.id}).then(function(result){
        if(result.data.success){
            $scope.user = result.data.data;
        }
    })
    $scope.updateRole = function(){
        if ($scope.newRole){
            var user  = {
                id : $stateParams.id,
                newRole: $scope.newRole
            }

            UserManagementService.updateRole(user).then(function(result){
                if (result.data.success){
                    flash.success = result.data.message
                    $state.go('user_manager');
                } else {
                    flash.error = result.data.message
                }
            })
        }
    }
})

controller.controller('ArticleManagementCtrl', function($scope, ArticleService, ArticleManagementService, flash){
    ArticleService.getAllArticles().then(function (result) {
        if (result.data.success) {
            $scope.articleList = result.data.data;

            $scope.dataTableOpt = {
             //custom datatable options
            // or load data through ajax call also
            "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50,'All']],
            };
        }
    })


    $scope.deleteArticle = function(articleId, index){
        bootbox.confirm('Do you want to delete this article ? ', function(yes){
            if(yes){
                ArticleManagementService.deleteArticle({articleId: articleId}).then(function(result){
                    if (result.data.success){
                        $scope.articleList.splice(index, 1);
                        flash.success = result.data.message;
                    } else {
                        flash.error = result.data.message;
                    }
                })

            }
        })

    }
})
