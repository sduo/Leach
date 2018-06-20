javascript: (function () {
    if (document.readyState !== 'complete') { setTimeout(function () { alert('请等待页面加载完成'); }, 0); return; }

    var rules = [{ tags: 'a', attr: 'href' }, { tags: 'span,p' }];
    var matchs = [{
        re: /\bmagnet:\?xt=urn:btih:[a-z0-9]{32,}.*\b/i,
        callback: callback_copy
    }, {
        re: /\bhttp[s]*:\/\/pan.baidu.com\/(s\/|share\/init?surl=)[a-z0-9]+\b/i,
        callback: callback_baidupan
    }, {
        re: /\bhttp[s]*:\/\/pan.eehhtt.top\/m\/[a-z0-9]{32}\?.*\b/i,
        callback: callback_open
    },{
        re:/\bhttp[s]*:\/\/mega.co.nz\/#![a-z0-9]+![a-z0-9]+\b/i,
        callback:callback_open
    }, {
        re: /\bhttp[s]*:\/\/subhd.com\/.*\b/i,
        callback: callback_open
    }, {
        re: /\bhttp[s]*:\/\/www.zimuku.cn\/subs\/\d+\.html\b/i,
        callback: callback_open
    }];

    var copy = [];
    var open = [];

    rules.forEach(rule => {
        console.log('Search : %s', rule.tags);
        var tags = rule.tags.split(',');
        tags.forEach(tag => {
            var elements = document.getElementsByTagName(tag);
            console.log('Find : %d', elements.length);
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                var content = element[rule.attr || 'textContent'];
                matchs.forEach(match => {
                    m=match.re.exec(content);
                    if(m===null){
                        return;
                    }else{
                        console.log('Match : %s[%d]', tag, i);    
                        if (typeof (match.callback) === 'function') {
                            match.callback(m[0], element);
                        }
                    }
                });
            }
        });

    });

    console.log('Copy : %d', copy.length);
    if (copy.length > 0) {
        document.addEventListener('copy', func_copy, true);
        try {
            document.execCommand('copy');
        }
        finally {
            alert('已复制' + copy.length + '项到剪贴板!');
        };
    }

    console.log('Open : %d', open.length);
    if (open.length > 0) {
        open.forEach(url => {
            console.log('%s', url);
            window.open(url, '_blank');
        });
    }

    function func_copy(e) {
        e.clipboardData.setData('text/plain', copy.join('\r'));
        e.preventDefault();
        document.removeEventListener('copy', func_copy, true);
    };

    function push_open(url){        
        if(open.indexOf(url)===-1){
            console.log("Push Open : %s",url);
            open.push(url);
        }     
    }

    function push_copy(url){        
        if(copy.indexOf(url)==-1){
            console.log("Push Cpoy : %s",url);            
            copy.push(url);
        }        
    }

    function callback_copy(content, element) {       
        push_copy(content);
    }

    function callback_baidupan(content, element) { 
        function get_code(e){
            var attr='textContent';
            if(e.tagName==='INPUT'){
                attr='value';
            }
            var text=e[attr];            
            m = /(提取|密)+[码]*[:：\s]*([a-z0-9]{4})/i.exec(text);
            return m===null?null:m[2];
        }

        var code = null;
        if(element.children.length>0){
            console.log('Children : %d',element.children.length);
            for(var i=0;i<element.children.length;++i){
                code=get_code(element.children[i]);
                if(code!==null){
                    break;
                }
            }
        }
        if(code===null){
            var parent = element;
            while (true) {            
                if (parent === null) {                    
                    break;
                }
                code = get_code(parent);
                if (code !== null) {                    
                    break;
                }
                parent = parent.parentElement;
            }
        }
        console.log('Code : %s',code);
        if(code!==null){
            content = content + '#' + code;
        }
        push_open(content);  
    }

    function callback_open(content, element) {
        push_open(content);
    }
})();