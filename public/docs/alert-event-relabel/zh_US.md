The functionality of relabeling alert events is similar to relabeling data during reporting. Below are several main usage scenarios and configuration methods.

##### **Scenario 1: Reducing labels of alert events by removing certain labels**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7fe9e90b550cdc484a0654be6fbfbdc9275201e154bd53f153db781ab54bf4dd6dd84e33fd71031ad788df21fd98061e.png)

As shown in the alert event above, there are many labels. If we want to remove some labels that we're not concerned about, we can use the labeldrop operation. For example, if we want to remove the listening_10 and host labels, we can configure as follows:

Choose labeldrop for the action. The regex is the matching condition for the label key, which supports regular expressions. It can be written as listening_10|host.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dfc7446a1f152f0de5391ffd517912103935bf579df97c45a18bfc402100b9ed27911790075a67b525769146d813d0b1f.png)

After saving, listening_10 and host will be deleted.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7c6a0f38d539d23bfe13ba1be54b2eb560500c2d6c17d92c925c5399406125525d940fa51d4aa0210872c2bb71eaaeab.png)

##### **Scenario 2: Reducing labels of alert events by keeping only certain labels**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7fe9e90b550cdc484a0654be6fbfbdc9275201e154bd53f153db781ab54bf4dd6dd84e33fd71031ad788df21fd98061e-20240716163623474.png)

As shown in the alert event above, there are many labels. If we want to remove labels we're not concerned about and only keep the ones we care about, we can use the labelkeep operation. For example, if we only want to keep the service, name, and addr labels, we can configure as follows:

Choose labelkeep for the action. The regex is the matching condition for the label key, which supports regular expressions. It can be written as service|^name$|addr. We write name as ^name$ because other labels contain "name", so we need to do a strict match.

![image-20240717112440461](http://download.flashcat.cloud/uPic/image-20240717112440461.png)

After saving, new alert events will only keep the service|name|addr three labels.

![image-20240717112033348](http://download.flashcat.cloud/uPic/image-20240717112033348.png)

##### **Scenario 3: Renaming the key of a certain label in the alert event**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dda1f8e63a7af05650bd323a2cc2f93b14383ac0aeb37a2c4ea921d6fb7c69dafc88a01f51ce8b4fa3b17ce1361c6c5db.png)

As shown above, if we want to rename `__name__` to `name`, we can use the following configuration:

Choose labelmap for the action. The regex is the matching condition for the label key, which supports regular expressions. It can be written as `__(name)__`.

The replacement can be a fixed value "name", or it can be a character extracted from the regex. Here, $1 is also "name".

After the new name label is added, the previous `__name__` label will still be retained, so we need to configure another labeldrop to delete it.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d7d29b87164bd1ef6e44760523167081be94c892404e2358c288d9d2dd99ad666cfa51bbc0bf1eac73f7b3228700ac3ae.png)

After saving, in new alert events, `__name__` will be changed to name.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0da4d5c3d3025c6297378d55ef09185e722582813a78a177fecb5c1bc9c94f1db2f96bd235409cdb7419eae4d01f44dbbb.png)

##### **Scenario 4: Modifying alert events by creating new labels based on existing labels**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dd2a47a113d102b8c30474dc31563308b821b1a62a0fe6b82d9b62769e9fddca19b7f3b04400c6db643a77e8ada3561aa.png)

As shown in the alert event above, if we want to construct a new label that includes the content of ident+listening_10, we can use the replace operation to merge ident and listening_10 together. The target_label is the key of the new label, separator is the connecting character, and source_labels are the labels used to construct the new label.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d01b1267c3bf01f6b59edef9677d1f9e97bb327a58e45651ea13dba56bbce541ed1d780bd4280bc8e4d17dc54c35c5919.png)

After saving, new alert events will have a new addr label.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0ddf368fbc39e9272c90e6f5e457da8165f8e6450e1dd23c5378737b5a490f254d5dce735943b0e33a23b7f3618e040736.png)

##### **Scenario 5: Modifying the value of a certain label in the alert event**

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0dfba2d951131a07110b68fa843492e7fe0f62ef3c8596b0d9389ff1b851e2aa829d67fa1a1f45a8984bd6b5792c76823f.png)

As shown above, if we want to modify the addr label to remove the port part, we can use the replace operation with the following configuration:

Choose replace for the action. The target_label is the target label, source_labels are the original labels to be used, regex extracts the part before the port, and replacement is written as ${1} to assign the extracted content to the target_label.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0db7556db413b5ebd91c5c1beee565fe8d12f1301ad7751b85b7f350c52d8f1a714fe93b6a4dbcaf5ac1308b3889bcd705.png)

After saving, in new alert events, the port in addr will be removed.

![img](http://download.flashcat.cloud/uPic/5eecdaf48460cde55ff344a279021d5238eed2ac5b1362b54a94cefac92b8e65b2bdfab878cb955439e8703ac5556d0d3363871b625c8750a15e16a5bdbe971331a13f62e19544813c611407bacc6ffcc9112bef15ce90b74513ce19c661fc97.png)
