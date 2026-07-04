import zh from '../lang_json/zh.json' assert { type: 'json' };
import en from '../lang_json/en.json' assert { type: 'json' };
import de from '../lang_json/de.json' assert { type: 'json' };
import ar from '../lang_json/ar.json' assert { type: 'json' };
$(() => {
    var lang_type_change = {
        'zh': zh,
        'en': en,
        'de': de,
        'ar': ar
    }
    // 多语言
    var langBox = $('.btn-lang-box');
    var langList = $('.lang-list');
    var langChild = langList.children();

    // 社区按钮组
    var btnGroupEn = $('.index-btn-group-en');
    var btnGroupZh = $('.index-btn-group-zh');

    let langType = 'en';
    let langIsOpen = false;

    var Language = {};
    Language.defaultJson = en;

    Language.template = function() {
        Language.domList.forEach((element) => {
            element.innerText = Language.defaultJson[element.getAttribute('data-key')];
        });
        $('#bindemail').prop('placeholder', Language.defaultJson['lang17']);

    };

    Language.change = function(type) {
        Language.defaultJson = lang_type_change[type];
        Language.template();
    };
    Language.qrDom = () => {
        Language.domList = document.querySelectorAll('.language-item');
        console.log(Language.domList);
        Language.template();
    };

    Language.qrDom();

        // 打开语言列表
        langBox.click(() => {
            langIsOpen = !langIsOpen;
            langIsOpen ? langBox.attr('class', 'btn-lang-box open') : langBox.attr('class', 'btn-lang-box');
        });
    
        // 语言切换
        langList.click((e) => {
            console.log(langChild);
            langChild.forEach((item) => {
                item.className = 'lang-item';
                console.log(item);
            });
            e.target.className = 'lang-item click';
            // currLangText.text(e.target.innerText);
            langType = e.target.dataset.value;
    
            $('html').attr('class', langType);
            Language.change(langType);
    
            if (langType !== 'zh') {
                btnGroupZh.css('display', 'none');
                btnGroupEn.css('display', 'flex');
            } else {
                btnGroupEn.css('display', 'none');
                btnGroupZh.css('display', 'flex');
            }
    
            console.log(langType, e);
        });
})
