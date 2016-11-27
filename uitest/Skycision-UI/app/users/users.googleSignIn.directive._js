// angular.module('skyApp.users').directive('googleSignin', function() {
//     return {
//         restrict: 'A',
//         template: '<span id="signinButton"></span>',
//         replace: true,
//         scope: {
//             afterSignin: '&'
//         },
//         link: function(scope, ele, attrs) {

//             // Create a custom callback method
//             var successId = "_onSigninSuccess",
//                 failureId = "_onSigninFailure",
//                 directiveScope = scope;
//             window[successId] = function() {
//                 var auth2 = arguments[0];
//                 directiveScope.afterSignin({ auth2: auth2 });
//                 window[successId] = null;
//             };

//             window[failureId] = function() {
//                 console.log('signIn failed');
//                 window[failureId] = null;
//             };

//             gapi.signin2.render('signinButton', {
//                 scope: 'https://www.googleapis.com/auth/plus.login',
//                 fetch_basic_profile: false,
//                 theme: 'dark',
//                 width: 220,
//                 height: 40,
//                 longtitle: true,
//                 immediate: false,
//                 cookiepolicy: 'single_host_origin',
//                 onsuccess: successId,
//                 onfailure: failureId
//             });

//         }
//     };
// });
