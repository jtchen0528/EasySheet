5/7 更新 陳兆廷
    
component新增：Intro.jsx，包含歡迎頁面及讓使用者選擇歌手、歌名等等

state: 
    song
    singer
    font
    color
    template[3]: // 100代表第一個 010 第二個 001第三個

5/8 更新 陳兆廷

找到api歌詞 https://www.bzqll.com/2018/10/39.html
但不會用 遇到CORS問題 （查api cors）

5/9 更新 陳兆廷

可以找到簡體歌詞囉嘻嘻

5/10 更新 李諭樹
* intro.jsx 中修改request lyrics的方式，原方式以註解取代，怕以後會用到
* 統整後得出以下:request到歌詞後會改變的state有 - lyrics, songID, singercn, stage。data state應該是存放只有request歌名時的5個result，在我的修改中沒有使用該變數
* 修改的功能:
    1. 使用者沒輸入歌手時會有提示訊息，告知redirect的結果
    2. alert_msg表示來自API錯誤提示訊息([API ERROR] 開頭)
    3. 使用者輸入無效歌名時視同輸入空白，但會提示使用者no result

5/11 更新 李諭樹
* 寫出兩個request API，分別為o_requestLyrics(較舊)、requestLyrics(較新)，兩個差在request的順序不同:
    1. o_requestLyrics: request 歌名+歌手(繁體) -> request 歌手(轉簡體) -> 從第一次的 5 個 result中request最符合的一個
    2. requestLyrics:   request 歌手(繁轉簡) -> request 歌名+歌手(簡體) -> 從第一次的 5 個 result中request最符合的一個
    3. 這些可從console的requst順序看出，而第2種方式準確度較高，但第一種較接近原本的構想
* 從第一次的 5 個 result中選擇lrc的機制是看歌手是否與使用者request相同；找到完全相同者時直接視為理想lrc。因此使用者輸入'告白氣球'、'蘇打綠'時結果會帶往蘇打綠的歌，這是待修正之處
* 新增LyricsItem.jsx, LyricsItem.css，已寫一點架構
* 
5/13 更新 李諭樹
* 目前Component的關係:Main > intro > ChordEditor > LyricsItem
* 從地2個state道地3個state時，ChordEditor會用handleLyricsSplit去處理使用者分好段的字串，但考慮到可能有上一步的功能要實作，因此可能要在地2個state就要使用到LyricsItem(in ChordEditor)了
* LyricsItem.jsx, LyricsItem.css，有增修

5/14 更新 李諭樹
* 打算改以BST存取LyricsItem(instead of Array)，並建置完BST的class(Tree.js)

5/14 更新 陳兆廷
* 改一下字型、背景、歌詞頁可以返回查詢
增加在編輯歌詞時就可以看到自己選的字形，還有增加上一步

5/17 更新 沈永聖
* src/api 修改translate-api.js，讓translate可以同時過濾 作詞 : ?、 作曲 : ? 與 [??:??:??]
* src/api 新增componentToPdf-api.js
* componentToPdf使用方法。在想要印出的component上給予id，並將id傳入function，便會開始下載pdf。
* 註:pdf的大小會隨著component的width與height等比例縮放成A4大小，故需在印出前將WIDTH與HEIGHT固定，使PDF有個固定的格式。

5/19 更新 李諭樹
* 可以直接在由LyricsItem組合成的元件上進行編輯，換行時可以觀察到紅色邊框描出的新LyricsItem。另可試試delete、backspace(目前做這三種handle)
* 接下來會處理chord mark的部分，準備開始做ctrl+c、+v等
* stage部分可參考ChordEditor.jsx的39行，基本上以ChordEditor為中心若有stage轉換會pop給Intro
* ChordEditor還沒做RWD，晚點加
* 小心得
    1. 想了想後才發現用BST處理這麼頻繁的節點交換真他媽ㄎㄧㄤ(已改回陣列
    2. 如果state是陣列型態有些array function不須透過setState去更新(ex splice)，有些要(ex map)。建議各位使用前必先看清楚使用規則不然就會在這個時段commit了
    3. 才發現componentDidUpdate他媽好用(哀...

5/23 更新 沈永聖
* 修改ChordEditor.jsx中159行之bug(少加'\n')
* 修正Lyricsitem.jsx中切換textarea跳行問題
* 修正Lyricsitem.jsx中單行時textarea會多一行的問題

5/26更新 沈永聖
* ChordEditor.jsx新增pdf功能(尚須做修正)
* 修正Lyricsitem.jsx打字問題
* 稍微修改compnentToPdf-api設定

6/3 更新 李諭樹
* 點擊箭頭以變換刷法
* 自訂和弦介面目前寫死成260px，歡迎有想法的人修改成responsive
* 同一block上點擊選單中的chord有小bug: 須選兩次
* 近期打的render採用選擇性render，因此存取DOM時記得先確認該元素是否有被render出來
* 
6/3 更新 李諭樹
* add 2 files: customSignUp.jsx, customSignIn.jsx in folder 'components'