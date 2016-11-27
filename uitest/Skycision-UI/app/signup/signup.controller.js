(function() {

    angular
        .module('skyApp.signup')
        .controller('SignupController', ['$scope', '$q', 'AuthService', '$mdDialog', 'UserService', SignupController])
        .directive('confirmPassword', passwordMatch);


    function passwordMatch() {

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                confirmPassword: '=confirmPassword'
            },
            link: function(scope, element, attributes, ngModel) {
                ngModel.$validators.confirmPassword = function(modelValue) {
                    return modelValue === scope.confirmPassword;
                };

                scope.$watch('confirmPassword', function() {
                        ngModel.$validate();
                });
            }
        };
    }

    function SignupController($scope, $q, AuthService, $mdDialog, UserService) {
        // so I don't get confused...
        var sc = this;
        sc.show = true;
        $scope.loading = false;
        // Primary Methods
        sc.signIn = signIn;
        sc.registerUser = registerUser;

        sc.validateForm = function(account){
            if ($scope.form.$valid) {
                sc.registerUser(account);
            }
        }

        sc.resetPassword = resetPassword;
        sc.verifyEmail = verifyEmail;
        sc.confirmResetPassword = confirmResetPassword;

        // UI Methods
        sc.onEscKeyUp = onEscKeyUp
        sc.togglePasswordShow = togglePasswordShow;
        sc.setMode = setMode;

        sc.registeredUser = null;
        sc.forgotPasswordUser = null;

        var formModal = $('.cd-user-modal'),
            formLogin = formModal.find('#cd-login'),
            formVerify = formModal.find('#cd-verify'),
            formSignup = formModal.find('#cd-signup'),
            formForgotPassword = formModal.find('#cd-reset-password'),
            formModalTab = $('.cd-switcher'),
            tabLogin = formModalTab.children('li').eq(0).children('a'),
            tabSignup = formModalTab.children('li').eq(1).children('a'),
            forgotPasswordLink = formLogin.find('.cd-form-bottom-message a'),
            backToLoginLink = formForgotPassword.find('.cd-form-bottom-message a'),
            formTermsCond = formModal.find('#cd-termsCond'),
            mainNav = $('.main-nav'),
            formConfirmReset = $('#cd-confirm-reset');


        function signIn(user) {
            AuthService.authenticateUser(user.username, user.password)
                .then(function(success) {
                    console.log('success', success);
                    $scope.loading = true;
                }, function(failure) {
                    console.log('failure', failure);
                    //alert(failure);
                    $scope.loading = false;
                });
        }

        function registerUser(account) {

            var otherParams = {
                "family_name": account.familyName,
                "given_name": account.given_name,
                "address": account.address,
                "email": account.email.toLowerCase()
            };
            AuthService.registerUser(account.username, account.password, otherParams)
                .then(function(result) {
                    console.log('success', result);
                    sc.registeredUser = result;
                    formLogin.removeClass('is-selected');
                    formSignup.removeClass('is-selected');
                    formVerify.addClass('is-selected');
                    formModal.find('.cd-switcher').addClass('hide');
                    tabLogin.removeClass('selected');
                    tabSignup.removeClass('selected');
                    $scope.loading = true;

                }, function(failure) {
                    console.log('failure', failure);
                    $scope.loading = false;
                });
        }

        function resetPassword(email) {
            sc.forgotPasswordUser = AuthService.resetPassword(email)
                .then(function(user) {
                    sc.setMode(4);
                    return user;
                }, function(){
                    alert("Error");
                });
                
        }

        function confirmResetPassword(confirmation) {
            sc.forgotPasswordUser.then(user => {
                if (!user) {
                    console.log('user is falsy');
                }
                user.client.confirmForgotPassword({
                    ClientId: user.pool.getClientId(),
                    Username: user.username,
                    ConfirmationCode: confirmation.code,
                    Password: confirmation.password
                }, function(err, data) {
                    if (err) {
                        console.log(arguments);
                        alert(err);
                        return;
                    }
                    alert('Success! Please login with your new password');
                    sc.setMode(0);
                });
            })
        }

        function verifyEmail(code) {
            AuthService.confirmRegistration(sc.registeredUser, code)
                .then(function(success) {
                    alert('Success!');
                    sc.setMode(0);
                }, function(error) {
                    alert('Failure!');
                });
        }

        //close modal when clicking the esc keyboard button
        function onEscKeyUp($event) {
            if ($event.keyCode == '27') {
                formModal.removeClass('is-visible');
            }
        }

        //hide or show password
        function togglePasswordShow($event) {
            var togglePass = angular.element($event.target),
                passwordField = togglePass.prev('input');

            ('password' == passwordField.attr('type')) ? passwordField.attr('type', 'text'): passwordField.attr('type', 'password');
            ('Hide' == togglePass.text()) ? togglePass.text('Show'): togglePass.text('Hide');
            //focus and move cursor to the end of input field
            putCursorAtEnd(passwordField);
        }

        // switch between nothing, signin, register, and forgot modes 
        function setMode(val) {
            switch (val) {
                case -1:
                    formModal.removeClass('is-visible');
                    break;
                case 0:
                    mainNav.children('ul').removeClass('is-visible');
                    formModal.addClass('is-visible');
                    formLogin.addClass('is-selected');
                    formSignup.removeClass('is-selected');
                    formForgotPassword.removeClass('is-selected');
                    tabLogin.addClass('selected');
                    tabSignup.removeClass('selected');
                    formModal.find('.cd-switcher').removeClass('hide');
                    formVerify.removeClass('is-selected');
                    formTermsCond.removeClass('is-selected');
                    formConfirmReset.removeClass('is-selected');

                    break;
                case 1:
                    mainNav.children('ul').removeClass('is-visible');
                    formModal.addClass('is-visible');
                    formLogin.removeClass('is-selected');
                    formSignup.addClass('is-selected');
                    formForgotPassword.removeClass('is-selected');
                    tabLogin.removeClass('selected');
                    tabSignup.addClass('selected');
                    formTermsCond.removeClass('is-selected');
                    formConfirmReset.removeClass('is-selected');
                    break;
                case 2:
                    formLogin.removeClass('is-selected');
                    formSignup.removeClass('is-selected');
                    formForgotPassword.addClass('is-selected');
                    formTermsCond.removeClass('is-selected');
                    break;
                case 3:
                    formSignup.removeClass('is-selected');
                    formTermsCond.addClass('is-selected');
                    break;
                case 4:
                    formForgotPassword.removeClass('is-selected');
                    formConfirmReset.addClass('is-selected');
                    break;
            }
        }


        //IE9 placeholder fallback
        //credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
        if (!Modernizr.input.placeholder) {
            $('[placeholder]').focus(function() {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            }).blur(function() {
                var input = $(this);
                if (input.val() == '' || input.val() == input.attr('placeholder')) {
                    input.val(input.attr('placeholder'));
                }
            }).blur();
            $('[placeholder]').parents('form').submit(function() {
                $(this).find('[placeholder]').each(function() {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                })
            });
        }
    }

    //credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
    function putCursorAtEnd(target) {
        return target.each(function() {
            // If this function exists...
            if (target.setSelectionRange) {
                // ... then use it (Doesn't work in IE)
                // Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
                var len = $(target).val().length * 2;
                target.focus();
                target.setSelectionRange(len, len);
            } else {
                // ... otherwise replace the contents with itself
                // (Doesn't work in Google Chrome)
                $(target).val($(target).val());
            }
        });
    }



})();
