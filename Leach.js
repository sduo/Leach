javascript: (function () {
    if (document.readyState !== 'complete') { setTimeout(function () { alert('请等待页面加载完成'); }, 0); return; }    

    var rules=[{tag:'a',attr:'href'}];
    var matchs=[{
        re:/\b(magnet:\?xt=urn:btih:)*[a-z0-9]{40}.*\b/i,
        callback:callback_magnet
    },{
        re:/\b(http[s]*:\/\/)*(pan.baidu.com)*(\/)*(s\/|share\/init?surl=)[a-z0-9]+/i,
        callback:callback_baidupan
    },{
        re:/\b(http[s]*:\/\/)*pan.eehhtt.top\/m\/[a-z0-9]{32}[\?.]*/i,
        callback:callback_eehhtt
    }];

    var copy=[];
    var open=[];

    rules.forEach(rule => {
        console.log('Search : %s' ,rule.tag);
        var elements=document.getElementsByTagName(rule.tag);
        console.log('Find : %d',elements.length);
        for(var i=0;i<elements.length;++i){
            var element=elements[i];
            var content=element[rule.attr||'textContent'];
            matchs.forEach(match=>{
                if(match.re.test(content)){
                    console.log('Match : %s[%d]',rule.tag,i);
                    if(typeof(match.callback)==='function'){
                        match.callback(content,element);
                    }                    
                }
            });
        }
    });

    console.log('Copy : %d' ,copy.length);
    if(copy.length>0){
        document.addEventListener('copy', func_copy, true); 
        try { 
            document.execCommand('copy'); 
        } 
        finally { 
            alert('已复制' + copy.length + '项到剪贴板!'); 
        }; 
    }

    console.log('Open : %d',open.length);
    if(open.length>0){
        open.forEach(url => {
            window.open(url);
        });
    }

    function func_copy(e) { 
        e.clipboardData.setData('text/plain', copy.join('\r')); 
        e.preventDefault(); 
        document.removeEventListener('copy', func_copy, true); 
    }; 

    function callback_magnet(content,element){
        if(!/magnet:\?xt=urn:btih:/i.test(content)){
            content='magnet:?xt=urn:btih:'+content;
        }
        console.log(content);
        copy.push(content);
    }

    function callback_baidupan(content,element){        
        if(!/http[s]*:\/\/pan.baidu.com/i.test(content)) {
            content='https://pan.baidu.com'+content;
        }
        var parent=element;
        var code=null;
        while(true){
            parent=parent.parentElement;
            if(parent===null){
                console.log('Code : not found');
                break;
            }            
            code=/(提取|密)+[码]*[:：\s]*([a-z0-9]{4})/i.exec(parent.textContent);
            if(code!==null){
                content=content+'#'+code[2];
                break;
            }          
        }
        
        console.log(content);
        open.push(content);
    }

    function callback_eehhtt(content,element){
        console.log(content);
        open.push(content);
    }
})();