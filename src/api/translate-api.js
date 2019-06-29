import {tify, sify} from 'chinese-conv';

//import translate from 'google-translate-api';
// 看是不是中文字

function isChinese(temp) 
{ 
	var re = /[^\u4e00-\u9fa5]/; 
	if(re.test(temp)) return false; 
	return true; 
}

function isContainChinese(temp)
{
	var cnt = 0;
	for(var i=0;i < temp.length ; i++)
	{
		if(isChinese(temp.charAt(i)))
			cnt++;
	}
	if (cnt > 5) return true;
	return false;
}

// 移除[00:00:00]等時間
function RemoveTime(text){
	let temp
	var re = /(?:\[.*\](?: *|\n*)|作曲.*\n|作(?:詞|词).*\n|曲 *: *.*\n|(?:詞|词) *: *.*\n)|(?:詞|词)曲 *: *.*\n/g
/*
	var re1 = /\[.*\]/g
	var re2 = /作曲.*\n/g
	var re3 = /作(?:詞|词).*\n/g
*/
	temp = text.replace(re,"");
	return temp;


}

//  簡體到繁體

/*
export function zhcnTozhtw(text){
    let temp

    temp = text;
    if(isContainChinese(text)){
        temp = tify(text);
    }
    return temp.replace(/[+[0-9:0-9.0-9]+]/g, '');
}
*/
export function zhcnTozhtw(text){
	return tify(RemoveTime(text));
}

