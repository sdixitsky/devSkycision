(function() {

    angular
        .module('skyApp.users')
        .factory('AuthService', [
            '$q',
            '$state',
            '$cookies',
            '$rootScope',
            'AWSService',
            'UserService',
            AuthService
        ]);

    function AuthService($q, $state, $cookies, $rootScope, AWSService, UserService) {
        var SERVICE = {};

        SERVICE.startAuthenticating = startAuthenticating;
        SERVICE.isAuthenticated = isAuthenticated;
        SERVICE.authenticateUser = authenticateUser;
        SERVICE.registerUser = registerUser;
        SERVICE.confirmRegistration = confirmRegistration;
        SERVICE.resetPassword = resetPassword;
        SERVICE.signOut = signOut;

        return SERVICE;

        function startAuthenticating() {
            angular.extend($rootScope, {
                user: null
            });
            // collect entropy for SRP Protocol RNG                
            sjcl.random.startCollectors();

            $rootScope.$on('$stateChangeStart', function(event, next, params) {
                console.log(next);
                var desiredPage = next.name;

                // redirect to login page if not logged in and trying to access a restricted page
                var restrictedPage = ['login', 'signup'].indexOf(desiredPage) === -1;

                SERVICE.isAuthenticated()
                    .then(yes => {

                        if (next.redirectTo) {
                            event.preventDefault();
                            $state.go(next.redirectTo, params, {
                                location: 'replace'
                            })
                        }

                        if (restrictedPage) {
                            angular.noop();
                        } else {
                            event.preventDefault();
                            $state.go(desiredPage === 'login' ? 'home' : desiredPage, params, {
                                location: 'replace'
                            });
                        }
                    })
                    .catch(no => {
                        // UserService.setUser(null);
                        if ('login' !== desiredPage) {
                            event.preventDefault();
                            $state.go('login', params, {
                                notify: false
                            });
                        }
                    });
            });
        }



        function isAuthenticated() {
            var u = $rootScope.user;
            if (!!u) {
                return $q.when(true);
            } else {
                return AWSService.getUserPool()
                    .then(userPool => userPool.obj.getCurrentUser())
                    .then(u => UserService.setUser(u))
                    .then(success => {
                        $rootScope.user = success;
                        return true;
                    })
                    // .catch( () => false );
            }
        }

        function signOut() {
            $rootScope.user = null;

            // AWSService.signOut();
            // service._user = null;
            $state.go('login');
        }

        function registerUser(username, password, otherParams) {
            return $q((resolve, reject) => {
                AWSService.getUserPool()
                    .then(userPool => userPool.registerUser(username, password, otherParams))
                    .then(success => {
                        resolve(success.user)
                    })
                    .catch(failure => {
                        console.log(failure);
                        reject(failure);
                    });
            });
        }

        function confirmRegistration(user, code) {
            var theUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                Username: user.username,
                Pool: user.pool
            })

            return $q((resolve, reject) => {
                theUser.confirmRegistration(code, true, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            });
        }

        function authenticateUser(username, password) {
            return $q((resolve, reject) => {
                AWSService.getUserPool()
                    .then(userPool => userPool.authenticateUser(username, password))
                    .then(user => {
                        UserService.setUser(user);
                        $rootScope.user = user;
                        resolve(true);
                        $state.go('home', {});
                    })
                    .catch((err) => reject(err));
            });
        }

        function resetPassword(email) {

            return AWSService.getUserPool().then(pool => {
                console.log(pool);
                var theUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                    Username: email,
                    Pool: pool.obj
                })

                return $q((resolve, reject) => {
                    theUser.client.forgotPassword({
                        ClientId: pool.obj.getClientId(),
                        Username: email
                    }, function(err, data) {
                        if (err) {
                            console.log(err);
                            reject(null);
                        } else {
                            console.log(data);
                            resolve(theUser);
                        }
                    });
                });
            });
        }
    }

})();
