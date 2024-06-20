if (config.theme == "red") {
    var r = document.querySelector(':root');
    r.style.setProperty('--color', '0,50%');
    r.style.setProperty('--l', '50%');
}
if (config.theme == "green") {
    var r = document.querySelector(':root');
    r.style.setProperty('--color', '120,50%');
    r.style.setProperty('--l', '50%');
}
if (config.theme == "blue") {
    var r = document.querySelector(':root');
    r.style.setProperty('--color', '240,50%');
    r.style.setProperty('--l', '50%');
}
if (config.theme == "black") {
    var r = document.querySelector(':root');
    r.style.setProperty('--color', '0,0%');
    r.style.setProperty('--l', '50%');
}

function validateLogin() {
    // alert("hi");
    uname = $('#uname').val();
    uname = uname.trim();
    psw = $('#psw').val();
    psw = psw.trim();

    if ((uname.length > 0 && psw.length > 0)) {
        $.ajax({
            url: './resources/php/validateLogin.php',
            type: 'POST',
            data: { request: 'validateLogin', uname: uname, psw: psw, searchAttribute: 'userid,username,layers,applications' },
            dataType: 'json',
            success: function (response) {
                // console.log(response[0]);
                for (var i in response[0])
                    var keys = i.split(",")
                var vals = response[0][i].split(",")
                window.localStorage.setItem(keys[0].trim(), vals[0].trim())
                window.localStorage.setItem(keys[1].trim(), vals[1].trim())
                window.localStorage.setItem(keys[2].trim(), vals[2].trim())
                window.localStorage.setItem(keys[3].trim(), vals[3].trim());
                if (!(vals[3].trim() == "admin")) {
                    window.localStorage.setItem('status', 'loggedIn');
                    if (window.location.href.indexOf("index.html") > -1) {
                        window.location.replace(window.location.href.replace("index.html", "map.html"));
                    } else {
                        window.location.replace(window.location.href.concat("map.html"));
                    }
                } else {
                    $("#loginContainer").css("display", "none");
                    $("#divUserManagementContainer").css("display", "flex");
                    $("#changePswUname").val("");
                    $("#existingPsw").val("");
                    $("#newPsw").val("");
                    $("#reNewPsw").val("");
                }
            },
            error: function (e) {
                showAlert(e.responseText, "alert-danger", true)
            }
        });
    }
}
function validateAndChangePassword() {
    uname = $('#changePswUname').val();
    uname = uname.trim();
    existingPsw = $('#existingPsw').val();
    existingPsw = existingPsw.trim();
    newPsw = $('#newPsw').val();
    newPsw = newPsw.trim();
    renewPsw = $('#reNewPsw').val();
    renewPsw = renewPsw.trim();

    if (newPsw != renewPsw) {
        showAlert("New Password and Re-Entered Password Donot Match...", "alert-danger", true);
    } else {
        if ((uname.length > 0 && existingPsw.length > 0 && newPsw.length > 0)) {
            $.ajax({
                url: './resources/php/validateAndChangePassword.php',
                type: 'POST',
                data: { request: 'validateAndChangePassword', uname: uname, existingPsw: existingPsw, newPsw: newPsw },
                dataType: 'json',
                success: function (response) {
                    console.log(response[0]);
                },
                error: function (e) {
                    if (e.responseText == "Password Changed Successfully") {
                        showAlert(e.responseText, "alert-success", false)
                        CancelChangePassword();
                    } else {
                        showAlert(e.responseText, "alert-danger", true)
                    }
                }
            });
        }
    }
}

function changePassword() {
    $("#loginContainer").css("display", "none");
    $("#divChangePasswordContainer").css("display", "flex");
    $("#changePswUname").val("");
    $("#existingPsw").val("");
    $("#newPsw").val("");
    $("#reNewPsw").val("");
}
function CancelChangePassword() {
    $("#divChangePasswordContainer").css("display", "none");
    $("#loginContainer").css("display", "flex");
    $("#uname").val("");
    $("#psw").val("");
}

function showAlert(messageText, messageType, modelTrueFalse) {
    $(".alert").addClass(messageType);
    $("#alertSpan").text(messageText);

    if (messageType == "alert-success") {
        $("#alertIcon").addClass("fa fa-check-circle");
    } else if (messageType == "alert-warning") {
        $("#alertIcon").addClass("fa-solid fa-triangle-exclamation");
    } else if (messageType == "alert-danger") {
        $("#alertIcon").addClass("fa-solid fa-circle-exclamation");
    }

    $(".alert").fadeTo(1000, 1);
    if (!modelTrueFalse) {
        window.setTimeout(function () {
            $(".alert").fadeTo(1000, 0, function () {
                $(".alert").removeClass(messageType);
                $("#alertSpan").text("");
            });
        }, 3000);
    }
}

function hideAlert() {
    $(".alert").fadeTo(250, 0, function () {
        $("#alertSpan").text("");
        if ($(".alert").hasClass("alert-success")) {
            $(".alert").removeClass("alert-success");
            $("#alertIcon").removeClass("fa fa-check-circle");
        }
        if ($(".alert").hasClass("alert-warning")) {
            $(".alert").removeClass("alert-warning");
            $("#alertIcon").removeClass("fa-solid fa-triangle-exclamation");
        }
        if ($(".alert").hasClass("alert-danger")) {
            $(".alert").removeClass("alert-danger");
            $("#alertIcon").removeClass("fa-solid fa-circle-exclamation");
        }
    });
}

var userData;
function updateUserData() {
    $.ajax({
        url: './resources/php/fetchUserIDs.php',
        type: 'POST',
        data: { request: 'fetchUserIDs' },
        dataType: 'json',
        success: function (response) {
            userData = undefined;
            userData = response;
            populateDeleteUserID();
        },
        error: function (e) {
            showAlert(e.responseText, "alert-danger", true)
        }
    });
}
function populateModifyUserID() {
    $('#modifyUserID').empty();
    $("#modifyUserID").prepend("<option value=''></option>");
    for (i = 0; i < userData.length; i++) {
        if (!(userData[i].userid == 'admn01')) {
            $("#modifyUserID").append("<option value=" + userData[i].userid + ">" + userData[i].userid + "</option>");
        }
    }
}
function populateDeleteUserID() {
    $('#deleteUserID').empty();
    $("#deleteUserID").prepend("<option value=''></option>");
    for (i = 0; i < userData.length; i++) {
        if (!(userData[i].userid == 'admn01')) {
            $("#deleteUserID").append("<option value=" + userData[i].userid + ">" + userData[i].userid + "</option>");
        }
    }
}
function populateResetUserID() {
    $('#resetUserID').empty();
    $("#resetUserID").prepend("<option value=''></option>");
    for (i = 0; i < userData.length; i++) {
        if (!(userData[i].userid == 'admn01')) {
            $("#resetUserID").append("<option value=" + userData[i].userid + ">" + userData[i].userid + "</option>");
        }
    }
}

function addUser() {
    var uid = $('#userID').val();
    var uid = uid.trim();
    var uname = $('#userName').val();
    var uname = uname.trim();
    var layers = selectedLayers.join("|");
    var layers = layers.trim();
    var apps = selectedApps.join("|");
    
    if (uid.length == 6) {
        if (uname.length > 3) {
            if (layers.length > 0) {
                if (apps.length > 0) {
                    $.ajax({
                        url: './resources/php/createUser.php',
                        type: 'POST',
                        data: { request: 'createUser', uid: uid, uname: uname, layers: layers, apps: apps },
                        dataType: 'json',
                        success: function (response) {
                            updateUserData();
                        },
                        error: function (e) {
                            if (e.responseText == "User Created Successfully") {
                                showAlert(e.responseText, "alert-success", false)
                                updateUserData();
                            } else {
                                if (e.responseText.includes("already exists")) {
                                    showAlert(uid + " - User already exists", "alert-danger", true);
                                } else {
                                    showAlert(e.responseText, "alert-danger", true)
                                }
                            }
                        }
                    });
                } else {
                    showAlert("Select atleast one application option", "alert-danger", true);
                }
            } else {
                showAlert("Select atleast one layer option", "alert-danger", true);
            }
        } else {
            showAlert("User Name must be more than three character", "alert-danger", true);
        }
    } else {
        showAlert("UserID must be six character", "alert-danger", true);
    }
}

function modifyUser() {
    var uid = $('#modifyUserID').val();
    var uid = uid.trim();
    var uname = $('#modifyUserName').val();
    var uname = uname.trim();
    var layers = selectedLayers.join("|");
    var layers = layers.trim();
    var apps = selectedApps.join("|");;

    if (uid.length == 6) {
        if (uname.length > 3) {
            if (layers.length > 0) {
                if (apps.length > 0) {
                    $.ajax({
                        url: './resources/php/modifyUser.php',
                        type: 'POST',
                        data: { request: 'modifyUser', uid: uid, uname: uname, layers: layers, apps: apps },
                        dataType: 'json',
                        success: function (response) {
                            // console.log(response[0]);
                            updateUserData();
                        },
                        error: function (e) {
                            if (e.responseText == "User Modified Successfully") {
                                showAlert(e.responseText, "alert-success", false)
                                updateUserData();
                            } else {
                                showAlert(e.responseText, "alert-danger", true)
                            }
                        }
                    });
                } else {
                    showAlert("Select atleast one application option", "alert-danger", true);
                }
            } else {
                showAlert("Select atleast one layer option", "alert-danger", true);
            }
        } else {
            showAlert("User Name must be more than three character", "alert-danger", true);
        }
    } else {
        showAlert("UserID must be six character", "alert-danger", true);
    }
}

function deleteUser() {
    var uid = $('#deleteUserID').val();
    var uid = uid.trim();
    var uname = $('#deleteUserName').val();
    var uname = uname.trim();
    var layers = selectedLayers.join("|");
    var layers = layers.trim();
    var apps = selectedApps.join("|");

    if (uid.length == 6) {
        if (uname.length > 3) {
            if (layers.length > 0) {
                if (apps.length > 0) {
                    $.ajax({
                        url: './resources/php/deleteUser.php',
                        type: 'POST',
                        data: { request: 'deleteUser', uid: uid, uname: uname, layers: layers, apps: apps },
                        dataType: 'json',
                        success: function (response) {
                            // console.log(response[0]);
                            updateUserData();
                        },
                        error: function (e) {
                            if (e.responseText == "User Deleted Successfully") {
                                showAlert(e.responseText, "alert-success", false)
                                updateUserData();
                                cancelDeleteUser();
                            } else {
                                showAlert(uid + " - " + e.responseText, "alert-danger", true)
                            }
                        }
                    });
                } else {
                    showAlert("Select atleast one application option", "alert-danger", true);
                }
            } else {
                showAlert("Select atleast one layer option", "alert-danger", true);
            }
        } else {
            showAlert("User Name must be more than three character", "alert-danger", true);
        }
    } else {
        showAlert("UserID must be six character", "alert-danger", true);
    }
}

function resetUser() {
    var uid = $('#resetUserID').val();
    var uid = uid.trim();
    var uname = $('#resetUserName').val();
    var uname = uname.trim();
    var layers = selectedLayers.join("|");
    var layers = layers.trim();
    var apps = selectedApps.join("|");

    if (uid.length == 6) {
        if (uname.length > 3) {
            if (layers.length > 0) {
                if (apps.length > 0) {
                    $.ajax({
                        url: './resources/php/modifyUser.php',
                        type: 'POST',
                        data: { request: 'passwordReset', uid: uid, uname: uname, layers: layers, apps: apps },
                        dataType: 'json',
                        success: function (response) {
                            // console.log(response[0]);
                            // updateUserData();
                        },
                        error: function (e) {
                            if (e.responseText == "Password Reset Successfully") {
                                showAlert(e.responseText, "alert-success", false)
                                // updateUserData();
                            } else {
                                showAlert(e.responseText, "alert-danger", true)
                            }
                        }
                    });
                } else {
                    showAlert("Select atleast one application option", "alert-danger", true);
                }
            } else {
                showAlert("Select atleast one layer option", "alert-danger", true);
            }
        } else {
            showAlert("User Name must be more than three character", "alert-danger", true);
        }
    } else {
        showAlert("UserID must be six character", "alert-danger", true);
    }
}

function cancelAddUser() {
    $('#userID').val('');
    $('#userName').val('');
    // $("#selectLayers").val($("#selectLayers option:first").val());
    // $("#selectApps").val($("#selectApps option:first").val());
    $("#selectLayers").multiselect('clearSelection');
    $("#selectApps").multiselect('clearSelection');
    // $('optgroup', $("#selectLayers")).remove();
    // $('option', $("#selectLayers")).remove();
    // $("#selectLayers").multiselect('rebuild');

    // $('optgroup', $("#selectApps")).remove();
    // $('option', $("#selectApps")).remove();
    // $("#selectApps").multiselect('rebuild');
}
function cancelModifyUser() {
    $("#modifyUserID").val($("#modifyUserID option:first").val());
    $('#modifyUserName').val('');
    // $("#modifyLayers").val($("#modifyLayers option:first").val());
    // $("#modifyApps").val($("#modifyApps option:first").val());
    $('optgroup', $("#modifyLayers")).remove();
    $('option', $("#modifyLayers")).remove();
    $("#modifyLayers").multiselect('rebuild');

    $('optgroup', $("#modifyApps")).remove();
    $('option', $("#modifyApps")).remove();
    $("#modifyApps").multiselect('rebuild');
}
function cancelDeleteUser() {
    $("#deleteUserID").val($("#deleteUserID option:first").val());
    $('#deleteUserName').val('');
    // $("#deleteLayers").val($("#deleteLayers option:first").val());
    // $("#deleteApps").val($("#deleteApps option:first").val());
    $('optgroup', $("#deleteLayers")).remove();
    $('option', $("#deleteLayers")).remove();
    $("#deleteLayers").multiselect('rebuild');

    $('optgroup', $("#deleteApps")).remove();
    $('option', $("#deleteApps")).remove();
    $("#deleteApps").multiselect('rebuild');
}
function cancelResetUser() {
    $("#resetUserID").val($("#resetUserID option:first").val());
    $('#resetUserName').val('');
    // $("#resetLayers").val($("#resetLayers option:first").val());
    // $("#resetApps").val($("#resetApps option:first").val());
    $('optgroup', $("#resetLayers")).remove();
    $('option', $("#resetLayers")).remove();
    $("#resetLayers").multiselect('rebuild');

    $('optgroup', $("#resetApps")).remove();
    $('option', $("#resetApps")).remove();
    $("#resetApps").multiselect('rebuild');
}

function backUserManagement() {
    $("#userManagement").children().css("display", "none");
    $("#userManagement").children().appendTo("body");
    $("#addUser").css("display", "block");
    $("#userManagement").append($("#addUser"));
    $("#selectElement").val($("#selectElement option:first").val());
    $("#divUserManagementContainer").css("display", "none");
    $("#loginContainer").css("display", "flex");
    $("#uname").val("");
    $("#psw").val("");
}

function populateLayers(ele) {
    $('optgroup', $('#' + ele)).remove();
    $('option', $('#' + ele)).remove();
    $('#' + ele).multiselect('rebuild');
    var layerGroupArray = [];
    for (i = 0; i < config.layers.length; i++) {
        if (!(layerGroupArray.includes(config.layers[i].layergroup))) {
            layerGroupArray.push(config.layers[i].layergroup);
            $('#' + ele).append('<optgroup label="'+ config.layers[i].layergroup +'" class="'+ config.layers[i].layergroup +'"></optgroup>');
        }
        $('optgroup[label="'+ config.layers[i].layergroup +'"]', $('#' + ele )).append('<option value="'+ config.layers[i].title +'">'+ config.layers[i].title +'</option>');
    }
    $('#' + ele).multiselect('rebuild');
    if(ele == "modifyLayers"){
        for (i=0;i<userData.length;i++){
            if($('#modifyUserID').val() == userData[i].userid){
                $('#' + ele).multiselect('select', userData[i].layers.split("|"),true);
                break;
            }
        }
    }
    if(ele == "deleteLayers"){
        for (i=0;i<userData.length;i++){
            if($('#deleteUserID').val() == userData[i].userid){
                $('#' + ele).multiselect('select', userData[i].layers.split("|"),true);
                break;
            }
        }
    }
    if(ele == "resetLayers"){
        for (i=0;i<userData.length;i++){
            if($('#resetUserID').val() == userData[i].userid){
                $('#' + ele).multiselect('select', userData[i].layers.split("|"),true);
                break;
            }
        }
    }
}
function populateApps(ele) {
    $('optgroup', $('#' + ele)).remove();
    $('option', $('#' + ele)).remove();
    $('#' + ele).multiselect('rebuild');
    var appsArray = [];
    for (const key in config.apps){
        $('#' + ele).append('<optgroup label="'+ key +'" class="'+ key +'"></optgroup>');
        for (const k in config.apps[key]){
        $('optgroup[label="'+ key +'"]', $('#' + ele )).append('<option value="'+ config.apps[key][k] +'">'+ config.apps[key][k] +'</option>');
        }
    }
    $('#' + ele).multiselect('rebuild');
    if(ele == "modifyApps"){
        for (i=0;i<userData.length;i++){
            if($('#modifyUserID').val() == userData[i].userid){
                $('#' + ele).multiselect('select', userData[i].applications.split("|"),true);
                break;
            }
        }
    }
    if(ele == "deleteApps"){
        for (i=0;i<userData.length;i++){
            if($('#deleteUserID').val() == userData[i].userid){
                $('#' + ele).multiselect('select', userData[i].applications.split("|"),true);
                break;
            }
        }
    }
    if(ele == "resetApps"){
        for (i=0;i<userData.length;i++){
            if($('#resetUserID').val() == userData[i].userid){
                $('#' + ele).multiselect('select', userData[i].applications.split("|"),true);
                break;
            }
        }
    }
}

var selectedApps = [];
var selectedLayers = [];
// start : onload functions
$(function () {

    $('#selectLayers').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var lyrs = $('#selectLayers option:selected');
            selectedLayers = [];
            $(lyrs).each(function (index, lyrs) {
                selectedLayers.push($(this).val());
            });
        }
    });
    populateLayers("selectLayers");
    
    $('#selectApps').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var app = $('#selectApps option:selected');
            selectedApps = [];
            $(app).each(function (index, app) {
                selectedApps.push($(this).val());
            });
        }
    });
    populateApps("selectApps");

    $('#modifyLayers').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var app = $('#modifyLayers option:selected');
            selectedLayers = [];
            $(app).each(function (index, app) {
                selectedLayers.push($(this).val());
            });
        }
    });
    
    $('#modifyApps').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var app = $('#modifyApps option:selected');
            selectedApps = [];
            $(app).each(function (index, app) {
                selectedApps.push($(this).val());
            });
        }
    });

    $('#deleteLayers').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var app = $('#deleteLayers option:selected');
            selectedLayers = [];
            $(app).each(function (index, app) {
                selectedLayers.push($(this).val());
            });
        }
    });

    $('#deleteApps').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var app = $('#deleteApps option:selected');
            selectedApps = [];
            $(app).each(function (index, app) {
                selectedApps.push($(this).val());
            });
        }
    });

    $('#resetLayers').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var app = $('#resetLayers option:selected');
            selectedLayers = [];
            $(app).each(function (index, app) {
                selectedLayers.push($(this).val());
            });
        }
    });

    $('#resetApps').multiselect({
        buttonWidth: '100%',
        maxHeight: 200,
        enableFiltering: true,
        // includeSelectAllOption: true,
        // selectAllJustVisible: true,
        buttonTextAlignment: 'left',
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        numberDisplayed: 0,
        widthSynchronizationMode: 'always',
        nonSelectedText: '',
        collapseOptGroupsByDefault: true,
        onChange: function (element, checked) {
            var app = $('#resetApps option:selected');
            selectedApps = [];
            $(app).each(function (index, app) {
                selectedApps.push($(this).val());
            });
        }
    });

    updateUserData();

    $("#selectElement").change(function () {
        var selectedValue = $('#selectElement option:selected').text();
        if (selectedValue == "Create User") {
            $("#userManagement").children().css("display", "none");
            $("#userManagement").children().appendTo("body");
            $("#addUser").css("display", "block");
            $("#userManagement").append($("#addUser"));
        }
        if (selectedValue == "Modify User") {
            $("#userManagement").children().css("display", "none");
            $("#userManagement").children().appendTo("body");
            $("#modifyUser").css("display", "block");
            $("#userManagement").append($("#modifyUser"));

            $('#modifyUserName').val('');
            $("#modifyLayers").val($("#modifyLayers option:first").val());
            $("#modifyApps").val($("#modifyApps option:first").val());

            populateModifyUserID();
        }
        if (selectedValue == "Delete User") {
            $("#userManagement").children().css("display", "none");
            $("#userManagement").children().appendTo("body");
            $("#deleteUser").css("display", "block");
            $("#userManagement").append($("#deleteUser"));

            $('#deleteUserName').val('');
            $("#deleteLayers").val($("#deleteLayers option:first").val());
            $("#deleteApps").val($("#deleteApps option:first").val());

            populateDeleteUserID();
        }
        if (selectedValue == "Reset Password") {
            $("#userManagement").children().css("display", "none");
            $("#userManagement").children().appendTo("body");
            $("#resetUser").css("display", "block");
            $("#userManagement").append($("#resetUser"));

            $('#resetUserName').val('');
            $("#resetLayers").val($("#resetLayers option:first").val());
            $("#resetApps").val($("#resetApps option:first").val());

            populateResetUserID();
        }
    })

    $("#modifyUserID").change(function () {
        var userID = $('#modifyUserID option:selected').text();
        if (userID.length > 0) {
            populateLayers("modifyLayers");
            populateApps("modifyApps");
            for (i = 0; i < userData.length; i++) {
                if (userData[i].userid == userID) {
                    $('#modifyUserName').val(userData[i].username);
                    break;
                }
            }
        } else {

        }
    });

    $("#deleteUserID").change(function () {
        var userID = $('#deleteUserID option:selected').text();
        if (userID.length > 0) {
            populateLayers("deleteLayers");
            populateApps("deleteApps");
            for (i = 0; i < userData.length; i++) {
                if (userData[i].userid == userID) {
                    $('#deleteUserName').val(userData[i].username);
                    break;
                }
            }
        } else {

        }
    });
    $("#resetUserID").change(function () {
        var userID = $('#resetUserID option:selected').text();
        if (userID.length > 0) {
            populateLayers("resetLayers");
            populateApps("resetApps");
            for (i = 0; i < userData.length; i++) {
                if (userData[i].userid == userID) {
                    $('#resetUserName').val(userData[i].username);
                    break;
                }
            }
        } else {

        }
    });
})
