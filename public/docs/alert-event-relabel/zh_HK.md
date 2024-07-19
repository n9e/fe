告警事件 relabel 的功能和在數據上報時對數據進行 relabel 類似，下面介紹幾個主要的使用場景和配置方式

##### **場景 1 對告警事件的標籤進行刪減，刪除某些標籤**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7fe9e90b550cdc484a0654be6fbfbdc9275201e154bd53f153db781ab54bf4dd6dd84e33fd71031ad788df21fd98061e.png)

如上圖中的告警事件，有非常多的標籤，如果有的標籤我們不太關心想去掉，可以通過 labeldrop 操作，將這些標籤 drop 掉，比如如果想刪掉 listening_10 和 host 標籤，可以配置如下：

action 選擇 labeldrop, regex 是標籤 key 的匹配條件，支持寫正則，可以寫為 listening_10|host。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dfc7446a1f152f0de5391ffd517912103935bf579df97c45a18bfc402100b9ed27911790075a67b525769146d813d0b1f.png)

保存之後，listening_10 和 host 會被刪除。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7c6a0f38d539d23bfe13ba1be54b2eb560500c2d6c17d92c925c5399406125525d940fa51d4aa0210872c2bb71eaaeab.png)

##### **場景 2 對告警事件的標籤進行刪減，只保留某些標籤**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7fe9e90b550cdc484a0654be6fbfbdc9275201e154bd53f153db781ab54bf4dd6dd84e33fd71031ad788df21fd98061e-20240716163623474.png)

如上圖中的告警事件，有非常多的標籤，如果有的標籤我們不太關心想去掉，只保留我們關心的標籤，可以通過 labelkeep 操作，比如我們只想保留 service、name 和 addr 標籤，可以配置如下：

action 選擇 labelkeep, regex 是標籤 key 的匹配條件，支持寫正則，可以寫為 service|^name$|addr, name 這樣寫 ^name$ 是因為其他標籤包含了name，進行下嚴格匹配

![image-20240717112440461](http://download.flashcat.cloud/uPic/image-20240717112440461.png)

保存之後，新的告警事件，只會保留 service|name|addr 三個標籤。

![image-20240717112033348](http://download.flashcat.cloud/uPic/image-20240717112033348.png)

##### **場景 3 對告警事件中的某個標籤的 key 重命名**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dda1f8e63a7af05650bd323a2cc2f93b14383ac0aeb37a2c4ea921d6fb7c69dafc88a01f51ce8b4fa3b17ce1361c6c5db.png)

如上圖，想將 `__name__` 重命名為 `name`，則可以使用如下配置：

action 選擇 labelmap, regex 是標籤 key 的匹配條件，支持寫正則，可以寫 `__(name)__`

replacement 可以寫固定值 name，也可以寫從正則中提取出來的字符，這裡 $1 也是 name

新的 name 標籤增加之後，之前的 `__name__` 標籤還會保留，需要再配置一個 labeldrop 刪除掉。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7d29b87164bd1ef6e44760523167081be94c892404e2358c288d9d2dd99ad666cfa51bbc0bf1eac73f7b3228700ac3ae.png)

保存之後，新的告警事件，`__name__` 會改為 name。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0da4d5c3d3025c6297378d55ef09185e722582813a78a177fecb5c1bc9c94f1db2f96bd235409cdb7419eae4d01f44dbbb.png)

##### **場景 4 修改告警事件，根據已有的標籤，構建新的標籤**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dd2a47a113d102b8c30474dc31563308b821b1a62a0fe6b82d9b62769e9fddca19b7f3b04400c6db643a77e8ada3561aa.png)

如上圖的告警事件，如果我們想構建一個包括了 ident+listening_10 內容新的標籤，我們可以使用 replace 操作，將 ident+listening_10 合併到一起，target_label 是新的標籤 key，separator 是連字符，source_labels 是用來構建新標籤的標籤。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d01b1267c3bf01f6b59edef9677d1f9e97bb327a58e45651ea13dba56bbce541ed1d780bd4280bc8e4d17dc54c35c5919.png)

保存之後，新的告警事件，會有一個新的 addr 標籤。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0ddf368fbc39e9272c90e6f5e457da8165f8e6450e1dd23c5378737b5a490f254d5dce735943b0e33a23b7f3618e040736.png)

##### **場景 5 修改告警事件中，某個標籤的 value**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dfba2d951131a07110b68fa843492e7fe0f62ef3c8596b0d9389ff1b851e2aa829d67fa1a1f45a8984bd6b5792c76823f.png)

如上圖，如果我們修改 addr 標籤，將端口部分去掉，可以使用 replace 操作，使用如下配置：

action 選擇 replace, target_label 是目標的標籤，source_labels 是要用到的原始標籤，regex 將端口前面的部分提取出來，replacement 寫 ${1} 將提取出的內容，賦值給 target_label。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0db7556db413b5ebd91c5c1beee565fe8d12f1301ad7751b85b7f350c52d8f1a714fe93b6a4dbcaf5ac1308b3889bcd705.png)

保存之後，新的告警事件， addr 中的端口會去掉。

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d3363871b625c8750a15e16a5bdbe971331a13f62e19544813c611407bacc6ffcc9112bef15ce90b74513ce19c661fc97.png)
