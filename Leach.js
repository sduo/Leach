javascript: (function () {
    if (document.readyState !== 'complete') { setTimeout(function () { alert('请等待页面加载完成'); }, 0); return; }

    var rules = [{ tags: 'a', attr: 'href' }, { tags: 'span,p' }];
    var matchs = [{
        re: /\bmagnet:\?xt=urn:btih:[a-z0-9]{32,}.*\b/i,
        callback: callback_magnet
    }, {
        re: /\b(http[s]*:\/\/)*(pan.baidu.com)*(\/)*(s\/|share\/init?surl=)[a-z0-9]+/i,
        callback: callback_baidupan
    }, {
        re: /\b(http[s]*:\/\/)*pan.eehhtt.top\/m\/[a-z0-9]{32}[\?.]*/i,
        callback: callback_open
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

    function callback_magnet(content, element) {       
        console.log(content);
        if(copy.indexOf(content)==-1){
            copy.push(content);
        }        
    }

    function callback_baidupan(content, element) {        
        var parent = element;
        var code = null;
        while (true) {            
            if (parent === null) {
                console.log('Code : not found');
                break;
            }
            code = /(提取|密)+[码]*[:：\s]*([a-z0-9]{4})/i.exec(parent.textContent);
            if (code !== null) {
                content = content + '#' + code[2];
                break;
            }
            parent = parent.parentElement;
        }

        console.log(content);
        if(open.indexOf(content)===-1){
            open.push(content);
        }        
    }

    function callback_open(content, element) {
        console.log(content);
        open.push(content);
    }
})();