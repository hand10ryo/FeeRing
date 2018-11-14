'use strict';

var conn;
let localStream = null;
let peer = null;
let existingCall=null;

navigator.mediaDevices.getUserMedia({video: true, audio: true})
    //streamobjectは自分のカメラ映像→表示用のビデオ要素にセット
    .then(function (stream) {
        // Success
        //srcobjectはDOMobjectなので、jQueryObjectから変換する
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function (error) {
    // Error
    console.error('mediaDevice.getUserMedia() error:', error);
    return;
});



peer = new Peer({
    key: '47301079-9ff3-4181-8f39-9481de565724',
    debug: 3
});

peer.on('open', function(){
    $('#my-id').text(peer.id);
});

peer.on('error', function(err){
    alert(err.message);
});

peer.on('close', function(){
});

peer.on('disconnected', function(){
}); 

//発信
$('#make-call').submit(function(e){
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
});

$('#end-call').click(function(){
    existingCall.close();
});

//着信
peer.on('call', function(call){
    call.answer(localStream);
    setupCallEventHandlers(call);
    
});

function setupCallEventHandlers(call){
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
        console.log(call.remoteId);
        const conn = peer.connect(call.remoteId);
    });
    call.on('close', function(){
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}

function addVideo(call,stream){
    //srcobjectはDOMobjectなので、jQueryObjectから変換する
    $('#their-video').get(0).srcObject = stream;
}

function removeVideo(peerId){
    $('#'+peerId).remove();
}

function setupMakeCallUI(){
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}

//canvasにvideoを展開
function drawVideo(){
    var w=$("#my-video").width();
    var h=$("#my-video").height();
    $('#canvas').attr('width',w);
    $('#canvas').attr('height',h);
    var video=document.getElementById("my-video");
    var canvas=document.getElementById("canvas");
    var context=canvas.getContext("2d");//描画機能を有効にしている
    //そういえば、表示する必要なかった
    context.drawImage(video,0,0,w,h);//表示場所の座標→大きさの2次元ベクトルが引数
}

//videoをstop
function stop(){
    if(video.mozSrcObject){
        video.pause();
        video.mozSrcObject=null;
    }else{
        if(localstream){
            localstream.stop();
        }
    }
}

//以下、チャット用
//参考:https://html5experts.jp/katsura/16331/
peer.on('connection', function(connection){
  　
    // データ通信用に connectionオブジェクトを保存しておく
    conn = connection;
    console.log("dataconnection="+conn.remoteId);
    // 接続が完了した場合のイベントの設定
    conn.on("open", function() {
        console.log("connection");
        // 相手のIDを表示する
        // - 相手のIDはconnectionオブジェクトのidプロパティに存在する
        
        //conn.idは仕様が変わったらしく、送受信どちらも同じ値がtheir-idに入るので消す
        //$("#their-id").text(conn.id);
    });
    // メッセージ受信イベントの設定
    conn.on("data", onRecvMessage);
});
 
// メッセージ受信イベントの設定
function onRecvMessage(data) {
    // 画面に受信したメッセージを表示
    console.log("receive")
    $("#messages").append($("<p>").text(conn.remoteId + ": " + data).css("font-weight", "bold"));
    console.log("1");
}
 
// DOM要素の構築が終わった場合に呼ばれるイベント
// - DOM要素に結びつく設定はこの中で行なう
$(function() {
    /*
    // Connectボタンクリック時の動作
    $("#connect").click(function() {
        // 接続先のIDをフォームから取得する
        var peer_id = $('#their-id').val();

        // 相手への接続を開始する
        conn = peer.connect(peer_id);
 
        // 接続が完了した場合のイベントの設定
        conn.on("open", function() {
            // 相手のIDを表示する
            // - 相手のIDはconnectionオブジェクトのidプロパティに存在する
            $("#peer-id").text(conn.id);
        });
 
        // メッセージ受信イベントの設定
        conn.on("data", onRecvMessage);
    });
    */
 
    // Sendボタンクリック時の動作
    $("#send").click(function() {
        // 送信テキストの取得
        var message = $("#message").val();
 
        // 送信
        console.log(conn.remoteId);
        console.log(conn)
        conn.send(message);
      
 
        // 自分の画面に表示
        $("#messages").append($("<p>").html(peer.id + ": " + message));
 
        // 送信テキストボックスをクリア
        $("#message").val("");
    });
 
    // Closeボタンクリック時の動作
    /*$("#close").click(function() {
        conn.close();
    });*/
});
