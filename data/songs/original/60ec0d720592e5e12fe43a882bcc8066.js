// Port of Lotus Esprit Turbo Challenge theme to my tracker, original by Shaun Southern
// May 2024 - Sychamis

// Samples
const noise = "gggglR7al1t6wqOBwQQRlDPNJPQQZQQRQQPQPQQQPQClQCPQQPSPQPQhdO6lP7YPjxj677776OLaOQClD636xXdPLPnr7gnq6O66QPLEOQTTPQQQPOPPNPPQMPQOQQPQQQbYRPOPPPOdPY776v7Qf37SsP671777vOQPQQQQQtxpNxlQLWaDPQQQRWPQzyWPSQPaNl6KDPsO4vRPJjcPQOQQQQQQQPPPPQQQQPPRC767rhNDuPDg677770YQ0e0LamQjPPz7epxi7gQPQQQTOPPLVPQQQc65Q16667cPO5Ql614ijzPPCWE6rYdPbOLPOYg6SO63oP2olPyPrPKVQqQQQPPQQPPFPQPQcmOQNn4wrr6zVPPOQnOQDUNg6yPQWQQQQQPnLV0LWikPPDlSe6XgkOQQQDXQPPPPYIOHNPPPKXPXPgRVlLdjOPPTe3d76f6bQsU0f6d26776lweu5n6257u60177r6u3676r6gs76svVPPPQQPQQQQQQQQQQPQQQQQPPOQXWDPPLPQPNPOTQPPQPPQPEPQQMQQQQQQQPQPQPPPQPPPLOKat077npsVmlpRogxn6O1t7777667777736jjQOUMhde6iE36z2wLVzP6j6o7Z635k0icuud6r4hVKPQQQQQQPQQQQPQQQQQQQQQQPPPNiwunruggukT16k666u6gYOPSNSDOLObLPSPNQOMWSkhOOOQt6yo777776x6pputxwl12566zrtUOKOOPPNPOQQQPPPQQQPQQPQQQQPQPPQPQQQQQPPOPPPQQQPOPQPQQQQPPOVNZfNYYTPPPPPTahb05hp3fnceOOOOPVgTNXrlu6667666gmoVXZZWabg1rigdWQVMNNRWkfhryggsdNPPPPOPPFQPQMPPQPQQQQQQQPPOPPPPQQQPQQNORQgObTKZSJnzvg666775056iYXgkuv2koKOMOWPPPPQQQQQQQQQQMPPNOPLPKOVFlgrn40576666675420566vmZcaYgWPNNKPQPQQQQQQQPQQQQQPPORXZjomcxagjbejukv11ntaVjgWnplf6nh56rekontusvl6651njdQOOMHOWaYYPXWVWSnjolxgZXaMOeUUPPNPPPOPPPPPQPPMNOQPeTXlons665qxnt566xwv2kqaeaTNOORRegdlgeujv26yupnlfooutbepteqZPaYbUpgmjRYLYWYWNMNQXZQZcTbYObZalZqioiagniahisogmrcupgcacYZcmTOaRSmdRPiTNePNEQNNPPPPQQPQQPPPPPPPOPPPMZagtwvw326t561zx65z566z7z11266663q2rzeWLLPMKMNPQQQQQQQQQQQQQQQPPPPPQQQQQQPQPPQQPPPPPNPPPPPPPPPPPPPQPPPPQQQPPPPOMSigsr4vxs5o16646tcjouv3x5yqndZejresntqigisr66556550zx5xyrukhmsdcgYXYYdgiVWSLOKIOPPPPPQPPQQQPPPPPPOPPPOOPPJNOKKNbhhloptq535zyzv04142vruynzy3636666x6qopnpkmhakTOMLPQQQQQQQQQQQQPPPQQQPQPPPPNMVdVWZSRWgjmp366666663665xzzwnqoeenbaplofgYYXXPQNOPPPPQPPPQPPPPPPPPPPPPPQPPPPQPPPOOPNKRMXPZYYdebXVZUXZXOONMOPONOQPNMSVWTOTXWaaSRMPPOOOPPNOPOLPHZjflnrsrnjoionrrrklYTeldggXOLOOOOPPPQPPPPPPPPPPOPNNUNLKLRNMRNOLSYaedfXkejckjlnidVbbdbhdjbYYbdhdbeahehXbbUbaWancagbVhchlpt1111wpihoory5323vxuqqqjjlhZdcWhjirqgcbWRZXbakkfeZVZQTLNQTLOTUUWVUYQLPQXUUeeQaZTSOVSTddffhgUTWURXfZagkentrlmmjmnppkmhbfgaWbbWdfbfpqqpwtjnopumhcZbZghdYVVXWbeaZffWdbbfjjotnopngutu1wsrmicedckfZcdbgflqkkinledhadfgbddaXcZaXXWYebegYVaZUXbbbfdaXZbedbbeYebbhjfchjYYbZakgalvtn04v15641yrwoqopisqlklfcXRTVWbVXbVPSQNOOPOPPOPPOPPPPPPPONNTSXiktsstpu35266145313204wqpldbfcdeUSbZXYONJRMOQUSUUOKOKJROQRPPRNRQUTQSSQTRQOSQYXRVWWYYcYcedhjmqzxtnqqtz456656753462z0ztpqmXVWTSRRNPNNPTTRSXQPTRZeihgcTXRNKPTQQNNKNOOOLNOJMKLLNLMKNSSSPRPQVTUUVUTUWXaXdeYYUVWYZdaZfaaiihigeedgeggigdifZaVRXaVUYPMQRRWYXadbaXceekiggdfaefZffVYaYXXVQQPPPQTSTZbabdgejmnjpmnmrnmjhklijliggcafXbcYYWTRPSSQRMKQPMPPPMKMMNOYfgddhnnqsqssxz1y0zz2141666664xohhabZcaQOLNMONOPOPONLPLPQNMNOOMUUTMRQRRSYaeYeZaWcWSUXTWWXWXUSOUUUSRTRVTXcfehfeeifgiiqonopnprtmkhaZZceabZYbbhgoqljmkpruzuurkhlqqlmrqtslihedadeefeXYbceVUUPKNNOPPPPPPPPQQQPPPPPPPPPOMLOVXdfippsvzzuvurvzx1zy2xtttunqrprurquzz10pnpnlmrsquvrpliebaaWWYZYXXUURNNPORPTRWYUTRTVYYYcfhhkkkmnkmoonnnnhgejmmiliefbcYcYZYSSUYUUTTVSVTUTTSUTUURUYbbdacYdgdgjknrpqvrtsvuvttrrppkmpoppnhjhfdjglfijefgjjlmmlhjhefijllkhjihglkijkjlgdbcacfeihihefehjdacdbbYWVUSTVVSUVUTWVVTWYZXXYbYWYXdbdbdgjhggfdfcdddfcYZbZbeaZdWWUSQSTXYZdbccgigllqotsrorqqpporqppnlnjmmkllhfegkklljifedekfdegdegdefcefdcbeghjllmklnnlljkllmlihdeeffghhhkllkmklononnllnlomospmjhffcYYXYXUVVXTSSRORRRSTVVZcabghgcbcahjjkmqrstuusqnmklllmljjlikhfefcaYZZZaZaXYWXZYaadhghfedbeggefdbbebbYWWaaceggcgijkkiifcaVWWVUSRROKJNOOOOONKNNSXYdefegiklnppnpptvz11xsrtrssvxx10yxvyxyxwuwvvuuwy1zywuolmmlnjjjjffgfddcYXXWYYYZZZacgillmligehhdfedacdYZYbabbaaZVWYZZbfccccaYcYXXVVVWXYZYbecbaZWXVZacedgedefjkjjigijjkjhhgfgjikifgfgddcaabZaccbedbbbddddfefeeccfdehfdhiffgjjhkihggfhdfgegfedccbbZddeffedfdcdigghgfdegkjllmmnkmqprpnllnppttruwxxz0xxwuurnpomlkiiihfecZYXYWUWXXXWUSTUVWYZXacbbabdgggdedcdefhffeefgffdcdfeefdegfedZVXVUUUXXXXXZWZZbaaYXXYabcechgfgfcbaZZZabbccdfghiikklmopppnnnosuvxvutqtttuvwvwwtrrpjjiiieeeedabaccYYXXWUWZacdbefeegggfeedcbcbcffhgggilpmkmkjmnmklkjllkhiijknmjkjkjkhkkgghhfceeccbcadebaabaccccaXWVVXYWVXXabaccaYZccdegfgjkklkhikgggecbbbbcbbaZZXWUXYaZcdefdcdeehhgfggeddcabbZbffcccdefghjmnopmnqqppmlhihecbbbcdebdecbaZaXXXWWVZZaddgikllmmnonklmklkjjjihjkoqqommmmnnnnqqpoolmlklmlkkjhhgegfghhhffgeeedcdddddbZaaXYYZZZYYXWWWXYYZacdddggikmmnqppqonlmlllmnmlmlijkkjihggfghgihgehjghggghhihhghgfdccccdffffgeeccdbcbbddcdeeeddddedeeecdfgghhggfgghjiihhgfhhfgghghhifgggfffggfedegffggeeeddbbcdcddcbccbbccdbabccddcbbcbbceccddffeecaaaZZbbbcdddcdcdedeghhiihhjjiiijjkkiiijjihiiiihghhhihhgggghhgggffggfeecceddccccddegggggfffggeeffedeefgihhgghihijkmnllljjjjlmnnnnnnnmkkjkjkiijiiiihhiihiiigghihgfeecbacbbbbcefeffedecefefgfgedeefeghhggfgggggghjjjkmllllkliiijhihhhhggfffdccbaZZZYZYYYYXXXXXWWXXXYZZbbccccabbbbbdfgghhiijjjiklllnnnnnnnnonlmlkjjjjkkllljkjjijklljjjjjjjiiihgffeddddeeccdddddefeddddddcddcbbaaYabcddefeeffefgfghhhggfffgfffggffgggggghhijiiihhgggggggggfeeddddcddcbcbccbccdccdcdeeeeeedeeffggfffffgfdddcccbcdedddededdcdeegggghhhghhhghijjjjiijjjjjjijklkllkklklkkkkkkkjkkjjkkjihhghhhgfgffeffeedcbbccbddccddbccccdddeffeeeeffffffffffhhiiiijiijiiihijiiihijijjiihhhhhgggggggggfefedddedccbbbccdeedeeeefffggfgggfgghijjkjjjjjkkkkkjjkmllllkklkjjjjkjjihhiiijihhhgfeddccbbbccbbccbbbcccddddddeeeeddccccccddccdccdddefffggffffeefffeefeeeefffffggggghhhhhiihiijjiiiiiiiihhhhhhhhhggggggffffeee";
const bass = "ggggvogWMDAAAAAAAAAAAACHLUQNMMGFAAAAAAAAAAAABGIQSdfkkdhmdghcSgcXckbanvfm21j1+yw47r3zvqwzrpomonwosqptx0w57++//////833zxtphbYWXUUNLMRTWVVRXXhedejlovqloorprlilffYeVLWaMISPCPQLIYTNZZSKiZRWgNEYSBMSNDVOObcaUmgcgponrnfnsmehZPZffZcbdainonx5////////+9742yoicZbVQPGEJULOOMOWaZYcckpupnzqqu3mnzqijmVWhXPOaIHVMCDcMLbZLOcXWeWRTVJEVSHFWNMVZWgkbYhkoptpjouwplhcYXegYWbddhdmrw4+///////////88rokmebWMIMSJMPFNXYQWdSgmqjpxnrwwjr3qjwpXbpZSZYKLRLELMJSbOJZdPSgcWVTORSLKOQJINQVYcZWVdokinplpuxtnchdgaYYcbYecbhoss3///////////8xxuplndPQVNLNMENVROWXNZkecpqiovpjswrrtphllcdgWOXXIFLNMNOQVUQRZbYXaUXQRQTLOSHEJXXVVXYUdijlgimxuqsnmficYWccVZdYchjhrx2+////////+556xwxkYecPPTHBOSMNURNVbZZhjhookmtrpvxonorkhebdZVNRPKLKRTQOTXQXZZVVdVPKYVRQJHKPPUZTPScgcehghtuorvqnogadcYZcZWchbajjl1////////////687uknjaYVLHMNKROMPUTRZbdekmilmpstspsqunilkeXeaUOORKLSSMNWUTTVZcaTQTYUSXTFFOPPVQLRZXacbbholltvqrxkejgWbeVVedaccXZry07///////////930uqllaSQQNLPMOPPQSTUZcehffippmpttoruqlnlfefcXSPOQPOLSXPKTZVYdXTTUVabSKLOLPUMISXRUcXXhheiqopxvolojcgeVTfebdaTUfjpv04+/////////+841wrlgZVSQNNNNPQQMNWZXZddeikmopqprsrqqnfkneVabSOPOQTTOOTQRagVRYUTdgTOTONRPJKTQOSYTVfeZekimuuqppnmmfZYbcggYUXYZfjlr09//////////++7zwtjdcYPMPQPONMMQSUXaZZfhflpnkpurpoqomlefkeVVXLOWVOQQKPZbVWWRUfdTUZRNSQJMQNOQRQVZYacbbkppqqpqtrkeabdfgeZVWZZWahnv5////////////940vpnfWUVQOSQLMPQOTXXVYddgihkqpkpupnqngjmiddZPSYVPTQHOZYTVWUXZZYZYVXUONPNLPPMNRUXYXXZejmmlntutsnebggeddYZbZVUYdhqx26///////////+4zxshbbYTTSPOOLNTROTZYXdfehmlipsopsnhmokjjcUVYYWSNMRSSVWSVZYWXZZZZXURNNPQMLNNRWWSTYZdhhgjpsuvrjhkjeefbcgaVWVSXhlnu49///////////+7ztqkbYbWQPQMMQPNSVTUZbbfhghlnnpqnmllorleccaaaWRQQSSSSUWWWYYUWbbZZVPQTROMMLQUTPSWVYfeZdknsvsnopkhihbcigZWWSTXZdjrv28///////////82ztlihbWWUQPPOORRRTUWZbbdffhlpomkkmpqnjgeefdYWVSRTSQTVVXYXUWabbdYSVYSNQOLOSSPPRTZcZWZfgkrsporpnkgfghfedaVVWSScijpx15+//////////71xtnjgcYWUPOPPPQRRSVYZabaeilmmkimpponkhhifcbZUUWROTUSXaVRWaaabaXYYWUSNLQVQMNPSUYYWVWaflllqtqopkehkhefgcYWTSUXbfkov16//////////+83xspkgdYUTRPQRPOQSVYZXXaehjkiglnmnplilkgfhcYZZURRTUWXUTWXXacZWZdcXSRQRTROOMLSYVTVWVYeggkqsqpnnljihhghebXVSSVYaejov38//////////952xtpmhcYUTUTPNQQRWXTTYZbfhggikkmomklmkjheefcWUTUTVXWSTWYaZXWcebZZVPTXUPONMOTUUTTVWXXbglnopqqnlkjhhjigeaUUVUUXadjqw17//////////+400wpkgaXZXSPPPQUUSSUWYbddeghjllkkmnliiighgcYVUTYYTRVYWXZXVZdecaXVWWWUQNMOQRRRVWUSVYZdikmpqoookiikkkiebZYVUUTVafiqy14+/////////8850uoigfbXTQPRSSSRSTUYaaadgghiijmmkklhgklfaZYXXXVTTVXYWVVXacdcZXXabWSRSPNOPRTUTTUTUXbehlnorrmklkkmlhggdYXXTQTWZelqw158/////////+72xsomjdZWTSTUSRRRTWXVXbccfhgfjllkiijkkjgdbaaZWUUWXWWWUUZddbZabbaYYXURQQNNSTRTURRVXXaehlprnlnmklmkjigecaWVTSSVaflrvy17/////////961xvrmidXWXVSRSSRSUUUWZbccdfhjkjiijklkhfgecbZWVVXZYVSUZaZadbZccZZbZUUSONQRRTURQUVTUYbfjmnnnmllmmllkhgfcZXVRPSWbhlnry38/////////7431vqlhdaYXVSSTTTSSUXYZabbehihhhijkkjihgghdXVYZXYXVUWYXZbbacbabdbZaXROQRRRRSSTTSRTVYdhjlnnlmnmlmmkjigfeaURQRVZceioty48/////////9740upkifbXWVUUTSRSVWWXXYbeffggfgkligiiiigbZaYXZYVVXVUXaaZbcaabdddaVTSRQQRRRTTRRSRSXadhkllmmllnomljijjhbWTSSTVYZdjpuy26/////////963zuqnidaZXWVSQSUUUWWVXbdddedgjighiiijheccbYYZYXWWVWXYaccaZbcdedaYXUSRRQRTTTTSQQSVXbehjklkknpokjkllljeZVUUTSTVaejosv17+////////962zwrkhfcaYWTSTTUVUTVZbabcdeghgfhiiiihgfcbbaYYZYWVVWZbaZaabceedcbYWUTRRSTUTSRQQRSTYdghhikmnnmlkkmomigdZXWTQRUXafjlqx26/////////974ztpmifeaWUVVUUTTUWYYYZbdeeefgfgijihhfecbZaaZXWVVXZZZZaabcefeddaYWUSSUUTSSTSQOQTYacefgjmnmlkkmoomkifebXTRSSVZachnrw158////////962xtqnkfcZYXWVTSUWWVXYYacddeeefghghhhgeccbbbZWWWWXZZZZaabcddeffdaWVVVTSUVUTRQOPTWYZacgklllkjlnnmmlkjieZVUTTUVWZeimqv049////////852yvsmhedcZXVUUUVVVWWYabccdddeeffhigfeddddbZYXXXYYYYZZabbbdggeccaYWUTUVVVUROPRSTVWXbfijkkjkmnmmmmmmkfbYWVTSTUXZdilqv158///////+864zuqmjgebZXVVWVUVVWXZZacddcddeghhgfeeedcbZYWWYYWXZaZZZadeeegfdcbXTTVWWWTPPQRSSSTWadfiiijlmmllmnonkifbZXVSSUVXZdglrw036////////962xtqnkhebZYXVUUVWWXXYZbccbcceggfffeeffcbaZZYXXYZYYZZZadddeeffebZWWWXXVTSSSSSSRSUYbcdfillkkklnoonmkigdZWUTUUUVYcimqty37////////951yvrnjhecaYWVVVVWWWYaaabbbcefffedfgfeedbaZYYYYZYXXXZabbcdeggfcaZZYYWVTTTUURQQSTVWYbehjjjjklmnnmmmljfbZXXVTSTVZehkoty38////////852yuqnkhfcZXXWWVVVWXYaaaZbdeeeeeefffffedbZYYZZYYXWYZaZZbdfffedcbbaYWUUVVUTRRSSSSTXacfghijklmlkmoomkifdcZVTSSUXacfkoty26+///////961xurplhebaYXXVUUWYYYYZabcddeeeefefggfdbaaaaaYXXYYYYYZacdeeedeedbYWWXWUUUTTTRQQSVYbccehjklkjknonmlkihfbXVTTUVWYcgkosx16+///////851yvspkgfdbZXVVVVWXXXYZabccdeedeefhhfeccccbZYYYYYYYYYabddcdfgfdcbZYXVVVVVVTQPQSUWXYadgijjjjlmmmmlllkhdaXWUTTUWYcgjnsx258//////+753zvrnkifdbYXWWWVWWXXZZabcdddddegggfeedddbaZYYYZYXYZaaaacefeffdccaXVVWWXVSQRRSTUUWZceghiikmmlklnnnljgdbZWUTUUWZbeintx037///////852yuqokhfcaZYXWVWWXYYZabccccdeggfffeeffdcaZZZYXYZYYZZZbdddeeffecZXWXXXVUSTTTTSSSVYbcdfikkkkkkmnnmlkigdaXVUUVVWYchlpsx169//////+740xuqnjhecbZXWWWWWXWYabbbbbcefffedfgfeedcaZZYYZZYYXYZbbccdeggfcaaZZYXVUUUVUSRRTUWXZbehijijkklmmmmmljgcZYXVTTUWaehknsx169//////+741xtqnkifcZYYXWWVVWYZabaabdeeeeeeffgffedcaYZZaZYYXYZaaabdffffeccbbZXVVWWVUSSTTTSUXacfgghjklllklnnmkifdcZWUTTUXacfjosx148//////9740wtqolhecaZYYWUUWYYYZZabcddeeeefefggfecbaaaaZXYYZZZZZbcdefeeeedcZXWXXVVVUUTSRRTVYbccehjkkkjkmnnmlkihfbYVUTVWWYcfjnrw048+/////+630xusokgfdbaYWVWWXYYYYabbcddeeeeefhhfdccccbZZZYYZZYYZabddddfgfecbaZXWVVVVWURQRTVXYYadgijjjjllmmmlllkhdaYWVUUVWZcgjmrw0369/////8531yuqnkigdbZXWXXWW";
const guitar = "gggg9o+4hggff+/wgfed89+//wgedbaYXYVUvzWfWUSRTwxz01WVUTSRQPPOONNMMMMLLLMMMMNNOOPvYTU1368//mjjihhggf9/8hgfeddcbaf5baZfZYXXWv346ba679+////ihgedb67baYv33455bYXVUSRQONMVprtONNMLPrtvwVSRQQPPOOOONNNNNNNNNOgPRURSVz2YY368+////mlkjihgff9+//+gfdcaZYWVUTUgSRQPPvxUSRxz0235678dcaZY3wYWVUTyz012XWVUSRQPONNsuvUQPOOVuvxz0wWVUUTSRQQPPOONNNNMMMNPNNOvURvwVV1468+/hhgffedccb789+ifedcbaZYXWXWVUTSTyz0WW134678+//4gfdcaZXWVUTyzz01YVUTRQQOONMVstgPOONPuvxz02YWVVUTSSRQQPPOOOSNNPNNNuYRRRRSSSx13579gffeeddccbb79++gfedcbacZY1aYXWWVVz2XW2Y25679+//hgfdcaZYXWVXz012wXWVUTSRQPOOuvwRRQQPPvxz123YYXWVVUTSSRRQQPPuxUSSSyVUUUU0gWW24679ofedcbaaZYX1354aZYYXWVVUTTSSRRRQQRxzVUf13579////jigfedcaZYf34566aZYWVUTSRQPvwxUSRQPPuwSxz0YWVUUTSRRQQPPPOPvwRRRRvwUUUX1YXWv3579+feedcbaZYXv356baZYXWVVVUTSRRRRQQuxwVfVVV13578+//hgfedcbaZZ35677gbaZYWVUTSRwyzgUTSRRRwVvyz1WVUUTSRRQQPPOOOuuRRRQvUSSSVzWVV03578+hfeedcbbaZY356caaZYXWVv1XWVVUTTSSSyzwWVV1356b689wedcbaZYXW123456aZYXWVUSRQuwygUSSRQQTvxy013XWWVUTSSRQQPPPvVQQQQPPPPPPPPPQXxz2468dddccbbaaab576dccbaaZ56baaZYYXWWW234aZZ3578ef9+/gfecbaZXW023456aZXWVUSRRPPvvxURRQPOfvgfxz0gVVUTSSRQQPPOOOfUPPPOOOuVRRRSSXz1368+feeddcbbaaZ156cbaZZYX244baZYYXWWV124ZYYX346gb789+gedbaZYWf23345gZYXVUTSQPPuvxxUSRQQPvwxz012ZXWVUTSRQPONXoONNNMMMLrstQQQRRxz1346cbbaZZYXWWVVf12XWWVVUv12YYXWWVVUUz13gYXX1357wd79+/gedbaZXW12334wYXVUTSQPONstvwgRQPONXusQfwxzWUTSRQQPOONPNMVtQPOOOfvsSSSSSy024679edccbaZYYXWV10XWVVUUTz1wXWWVVUUTX01YXWWVv245ba679+gedcbaZf35567cbZYXWUUSRQvxywUSSRQPuwURvxz0VUTSSRQQPPOOqrxyVUTTSyzWVVUTy023578gcbaZYXWVUUSSRQQPPOOPuwywVUUUTTTXwVV1gXXX3564cc78+/hfedcaa56788kcbZYXVUTRQvwxyUSRQPOPuoQPvwyoUTSRRQPPPOOTuwxUTSSSy02XXWW135679+/gedcaZYXWVTSRQPOONNMNruvURRRRRQQQQQRvwUUz13waaf68+/ggfedc789+//kgedbaYXWVv011ZWVUSRQVvVQTvxywUTSRQQPPONtvwwUSSRRXxyVUTfz1346789wdcbaYXWvWUSRQPPONMLLUstvUQQQPPPPPPPuoRSxz13ZYY25789edccbaz6789+fdcbZYXVUUz01wWVUSRRQfvwURQfwwSSRQQPPOOuvxzVUUTTSxYUVz235679+///igecbZY133XVUSRQONMLKprsVONMMLLKKKKKKfqsvxzYVVV13468cbaaZYX34564baZXWVUTSxyz1WVUTSRQTwxYSRRRwyUTSRRQQPXwyzgVVUUTTSSRvz1245789+/wgedcaZX233wYWVUSRQONPtuvPPONNMMLLKKKfrtrxzgVVUU12356baaZYXX2345bZYXWVUTSUxyzWUTSRRQPuwyUSSRQwyWUTSSRRQuxzYVUUTTTSSSy023578+////jhgecbZZ345wYXVUSRPONrtuUPONMLLKKKJJVqsutURRRQQXxz135gaZZYX1456wbaZYXWVUUz010XWVUUSSXyzYUUTSUyzgVUUTSSRxxUTTSSRRRRRxz121679+///wigfdcaY2445gYXVUSRQPPtusPOONMLLKKJJJprtgPPPPPPPPvy024gaZZYY3578dcbaZYYXWX134aZYXWVUUz12XWVVUy02gXWVVUTSSRRRQQPPPPPvy023579+////jihfecbZ4566caYWVUSRQtvwUQPONNMLLKKKPqsuPPPPPPPPPvy023gZZZYZ457dcbaZYXXWV0235aZYXWWVv12gYXWVVz13aYXWVVUTSSRRXQQQQQfxz135689////oihfecbZf3455bYXWUTRQPuvoQPONMLLKKKJJprtUPPPPPPPPtwz135gbaaZ468wdcbaZYYXWV1344aZYXWVV023YXWVUUz13ZXWVVUTTSRRVUQQQPPtxz134689////jhgfdbaZz3455aYXVUSRQPvvUPONNMLKKJJJXqssPPOOOOOOOuxz135wbbaZ577dcbaZYXXWVv134aYYXWVVz13gYXWVVX023YXXWVUUTSSRRQQQPPPvxz13578+////jhgfdcaZ34556aYXVUTRQtvUQPONMLLKKJJLqrtUPPPPPPPPPvy02367dccb37kcbaaZYXWVV0230ZYXWVVf022YXWVVUUz120YXWWVUUTSRRQQQPPtxz024679+///ohgedbaYX23344YXVUSRQPrqONMMLKJJJIIIXqrsPPPPPPPPPXxz13579gedf94fdcbaZYXXWf123ZYXWVUUz02YXWVUUTSXy01oXWVVUTTSRRQQQQTwy023478+////ihfecbZXf2334gXWVURQPONMLKJIIIHHHHHHnpssPQQQQQRRRxz2468+8gff+/kgffdcbaZYX2344aZYXWVz123YXWVUUTSvy01wXWVUUTSRRRQPPPswy02ZX35689+wfecbaZXW12334aYXVUTSQPONNMLLKKKJKKKKqtvURSrUTTTTT02468+//ij///jigfecbaYXX123aXWVUTTyz0YVUTSRQQPuvxzyVUTTSRRQQPPOOOuwyzwWv35679+gedcaZYXW12345ZYXVUTSRQPONNMMLLLKKKKPrugRRvyWVVVVV2468+///////oljhgecbZXWf010VUSRQPuvwxUQQPONMLLqsuvoRRQPPOOONNNMMVtvxzWV1346894edcbaZYWX1234gZXWVUSRQQPONNMLLLLLKKKnssURuz0XXXXXv3579////////mkigedbZXWUyz0WUSQPOftvvuQPONNMLKLqstvgQQPPOONNNMMPNPtvxyVV124679gdcbaZYXW02345aZXWVUTSRQPOONNMMLLLLLLUsusv032aaZZZ2579+///////+kigecaYWVUTxxwRQPOMLrstugPONMLLKJLqrtuUQPPOONNNMMMNNXtvygUf135789edcbaZYXW1345waYXWVUTSRQPPONNNMMMMMMMpuvvz245cbbaa578+////////wjhfdbZXWUSvxxUQPNMLPqrsuUONMMLKKJVprtvYQPPPOOONNMNQNpuwxUTz23578gdcbaZYXWf2345aZYXWVUTSRQPPOONNMMMMMMNruwy1357ddccb689/////////ligecaYWVURwwgQPNMLKpqstuPONMLLKKJfqrtvgRQQPPOONNNRUOrvxwUX024578dcbaZYXWW02344ZYXWVvxVUTSRQPPONNNMMMMMruvxz245gbaaa5689+///////igecaYWUSRUuvPOMLKJPoqrssONMMLKKJJnqsuvwUSRRQQPPPPqQPrwygV023567ocbaZYXWVUz012gXWVUz01YVUTSRQPONNMLLLKLpstvy023kZYYX2356789+///wfdbZXVUSQPXtUNMKJIImoqrtVONMMLLKKKprtvxyoVUTSSSRQUgRQtxxWz134678dcaZYXWVUVz011XWVXz012YWVUTRQPONMMLLKJLprsuxz021YXXWv23567789++gdbZXVUSQPNOLKJIHGFHlnprtQONNNMMMMMsuvy013ZYXXWWVUnVUTvzz145789+4edcaYXWVTfyzyWUTvyz011XVUSRQPOMLLKJIIIPnpqruxz01YWWVVy123456788dbaYWVURQPNMLKJIIHGfnprtsPPPOOONNNNtvxz134aZZYXXWVxWVVvz0356789+gecbZYXVUSTVQONPsuvxyz0WVUTSRQPPONNMMMLXrsrpy1245wbaZZf456789++/fdbaYWVSRQONMLKJIHHnpqsuQPOOOONNNNMsuwy124gZZYYXWbwWVVXy1346789+fdcbZYWVUTSRQPOVuvxz012XWVUUSSRQPPOONNNVroUVvz1345gbaab56789+//8gecaZXWUSRQONMLKKJPprsuoQQPPPOOOONNrvxz124waZZYXXroXWWb0345789+oedbaZXWVUSRQPPOruvxy01wXWVUTSRRQPPOONNNOfYPPpvy0240aaZd679+////khgedbZYWVUSRQPONMLrtuvxUSRRQQPPPOOOfvxz1350baZZYXzgXXWz245678+/fdcbZYWVUTRQPONNrtvwyz1YWVUTSRRQQPPONNNNNONNNUuwz13waaZf679/////kihgedbaYXWVUSRQPOPuvxzgUUTSSRRQQPPPXwy02354bbaZZawYXWX0245789+wedcaZXWVUSRQPOONsuvxz01XWVUUTSRQQPPOOONNNNNNNPuxz13waaaf689////8jihfedbaZXWVUSRQQPtvxzzVUUTSSRRQQQPPUwy02354bbaZZaZXWWf0246789+gedbaZYWWuUTSRQPPuvxz012XWWVUTSSRQPPOONNNNNNNNUuwz13waaZf689////mihgfdcaZYWVUUSRQPPvwyzYVUUTSSRRQQQQQRvy02350bbaaZaZXXXv135679+8fecbaZXWz0WVUTSRRwxz012gXWVUTSRQQPOONNMMMMMMMMUtvy020ZZZb578+///ihgfdcbaYXWVUTSRQPfvxzzVVUTTSSRRRQQQPPvy0235wcbaaZdoaZZf146789/hedcbZYXf2wWVUTSRVwyz012YWVVUSSRQPONNMMMLLLLLLLPsvxz12ZZZf579+//8ihfedcaZYXWVUTSRQQvxy0gVVUUTSSRRRQQQQRwy02464cbbaaz2gccn5789+//gedbaYXW01oVUTSRQfvwxz00VUTSRQPONNMLLLKKKKKKKKKNruwz11YYYv579+//khgfedcaZYXWVUTSRRXxy01XWVVUTTSSRRRQQQRxz13460ccbab355hf69+////kgedbZXWX00gUSRQPNrtvvwxoSRQPONMLLKJJJIIIIIIIIJJPrtvy01YYYv579///ihgfedbaZYXWVUUTSRwy01gXWWVUUTSSSRRRQQTxz1356wccba167773+//////igfcbZXVvzzWSQPOMLqrstuvUPONMLKJIIHHGGFFFFFGGGHHVqsvx01YYY3679//whhgfecbaZYXWVUUTSVyz12YXWWVUUTTSSRRQQQTxz13464dcbd57899+//////wigecaYWUyyzVRQOMLPqqrstuPONMLKJIHGGGFFFFFFFFFGGHVpsvx01YYY468+//jhggedcbaZYXWVUUTSxz022YXWWVUUTTSSRRRQQUxz13566dcc379+++///////jhfdbYWVUxyyUQPNLKXpqrstsONMLKJIHGGFFFEEEEEFFFGGHfqsvx01YYb579//+ihgfedcbaZYXWVUTSUy013gYXWWVUUTTSSRRRQQTwy02566dcf79//////////4jgecaYWUXxxwRQNMLJnpqrstgNMLKJIHHGFFEEEEEEEFFFGGHmqtvy12ZZv78+//kihgfedcbZYXWVVUTSxz023ZYXWVVUTTSSRRQQQQQvyz2356kj8+///////////ligebZXVSvwxgQOMKJInopqrsQMLKJIHGFFEEEDDDDDEEEFFGHnrtvz13ab68+//+jihgfedbaZYXWVUTTVyz120YXXWVUUTSSRRQQQPPPrxz135669////////////8khfdaYWURvvvUOMKJHPmnopqrLKJIHGGFEEDDDDDDDDDEEFFGLoruxz2437+////lkjigfecbaZXWVUTSRvxz01YWVUUTSRQQPPOOOONNNXvxz13578+///////////mjhecaYVUTwwwQOMLJImnopqroMLKJIHGGFFEEEEDDEEEFFFGHVpsvy03579////wkjihgedbbcYWVUTSRVxyz12XWVUUTSRRQPPPOOOOONPuxz13578+///////////ljgecaXVUXwxYQOMLJJopqrrtUNMLKJIHGGFFFFEEEEFFFGHHHnrtwz1368+////ljihgfdcbvgZYWVUTSxz012wYWVVUSSRQQPPONNNNNMOtvxz13579//////////wkhfdbZXVUfwwQPOMLJXpprsttONMLKJJIHHGGGFFGGGGGGHHIJpsvy03579////lkjihfedbv4baZXWVUXz0133ZXWVUTSRQQPOONNNMMMMMsuwz134689+////////ljhfcaYWVSfvVPOMLKJoprstuYPONMLKKJIIIHHHHHHHHIIIJJPruxz2479////wlkihgfedf64caZYWVUz01232YXWVUTSRQPOONMMMLLLLLrtvy0246799///////8kigecaYWUSSQOMLKJIfnprsu";
const drum1 = "ggggB/A/33yYocXCbAAZCQZfc//v/7om/Y/gJ8ogMUrJlAifMTUNVIVQOdgkvmst/8//h7kolwevunqdZWTRMXLAAAFACMRRpcrnp2/jw4i/vkpvy3/j5V0qhYrUeXeZbRYeLhUSRRUVLAMKjCKcgrW2njy7w6w96r40n5m/pmw5lwk1hpiZWROPNEICAKAPJHTPqPohn2X3jvl1r24znlrwo4pvepemfPdGQVNAMPSNNPAfGjhVbmYmnovt4m/p04/8v/xlmmdscZZdPkbVRebGQJQNGHOJdcXcgfXchqzxuupz/x/y1vyuyffagaiPUNYZOlJXOIMGHVHAhLYfaun6dqltow7q9w9ut+vxfpqnieaOVYcPVUFdKWKUMTQORVfZrTXcechpun2p/u0l3pvtscwohfbVSaOUUaYQWYXgDSJOQGpYSuNknZpzkqisUvwrp1s/x02v1orihYgQhVVYSOWgSNKAPRVSHTfUaodxgfwnguohxnztzv7y7rzvfkhaQbLRNKPCOHZSXjiThgkXZfaYUnelfjjZzopo+m7qoxiopXSXhnkdxnlfldjYfKYNXONONSdabiRgfagYXafekledjsqotswztw2psslrinuXckYwTkcUXKVCRATTHPSWWXbTjlnc0eylwth3sxy2u12jojocdbfQmLhbcShRhTTQMWISLHWVYhtki2mxnpupkumtrkqputooqnjYsfWmefWNjGaTHdWhNWkQgfbbYgklcYkTmk2gsw2n90o1h2lebbZbPZXjTbbYbUcWaMUZMQLXQZcXkkmpqrczc2msfgjynxfingmjoritdnXYNOeIPVNTaHbZjandfggghkmbhcjgYomqvg1kipmfWiWbiXedbjbghUodtiVkdXedidWkfggxYrmnUkPdRhbZhimdojugjoZoehegVjhfleevjyrcnajQZWXYdXZgXeZjesZceWkOWkRRSxcqm1e2kqofmdiifoVofmqbhegbVfcMcIbXWfgbjcoefgcsjlUWhlSmkejkklnjnpulqqlnkeqZqfUiVgTTShGhZfSfUmcfbggcnUkfghrbpiitqpnqjeknefbekqfglTgjZdTfPRmVRlPheWZpSkZidfsTsgigpcrjhridvc0fjqndnobXiJfTSVcYiVicjejceeifUjjikcbifcZgiinbqkpj6ronsonkSfQfXWVNgKgQWRjVdZfYqhichkfh0emklfnfgtfyrosroXrZelQcfbgbWXdTaYhcgTajJkaVeZwbvpeziniopjudvbpfqZrUmegWjRkTbjScTSXfXQdVyfvUxbwnrplmkahldeUhdlelohunndaddZgbLWlSeYXgXcRjfefngrcqshtsp1cvkskneYkWgbjVlhcfgbZWTUYaeTbbXYeXkjYwkqqngobmakfpmmjmqnomfZdXYcbdYVgQehYgfchhaiWnbdjZeYohjolnpolppojkdfWYbjZfYeZecVicclThggboPnShdhXkajSoewbmfniolosmsqegeakZggboTvPheZaTgUgUWcTcaidresqgtjlhkpVfTgabaSkahffUehcbmemchkkmkmionhmdignpigoVeWgVTfbbYRdRfhffmjtiqgllfjdibefapjngdrgsehggfbcccZfaXaYkfibihlamgliZdjeeajkfjikjkekjjggiZfYSjUgkYbpufqhfegcaXhYdfdjahdegdciedgfmfdgfbhelaijinchlgarYegkdlbjnkimTmZdkablchfhfecaccghfWeaebVgfmmfkhijkdidggehkdlhromokjsjgjTgcTYUWeWbXeidfafdeXjbkZpmmrrlultonknegjhjbjcgYjUfRdVdVXZddXidhgdhdYdfeghhkrkmlippiqftcogggegffdcgfXkZYcUfaeededglififjbfbgkijlkjemkkibhgZfgaXZcaddfigljgikegXgfeedhcofmoohjcmfkcbgbaedgafYmcfbihjecgekcfihkimemhfifhghdfagedlhlfmgjejhmfffcagbhcbebdYeeXhYigjnhnefjfgigfjfifgcfhbhbiblehkhnfiagcbddZdXfWgZebcfjhjkknltejgnghlclidifhccfaeabaefjemcgghegffddXfdebdcfijgoklmgnigkgkfhgiijjkdghbffdZcgebjXfZfeahddigkgqfijkZkddiafhghafidbghiggngohikkjgkefeZgbdXeVbcZdbcefgkejhklfgkgqhmkjjjkfjjhhbgecdfchffcedZddadeaidhfciefeeeahfcjhlihlikjfhfidgghhkfhhkfgebeeddedfadcbhcbhbjeijfjijmfnhkjjgieehbgeefjdiahcdeacbcfajfeifhfhggljhnkjjimliijikgfeecdbYXZdfdccfifdhfhbgceceefcfhghkkklnjkmhkkifkefgeicifgdbeddcecfcdcddedadbcedffehfiiiikminkjjjjceebfbcdeffhfgghhffgdeceedghclejgijghhfffhffhgjkhkiigghgegfffeebdeceehehikfghgeggdjfffghhfgjggghfjfgiehghefegffeehifhfgffdedecabccdegghgihijiihfihgeggiefefegfffgdeceedeffifkhighggcdfgcfdfgehgghfkijgjjfgeegedcefefeefeeefggiggjfjfgegegdfdgihhihhihghihfhfhghfdegfgghfgheeffgdedegegfdeegfehejghiiiihhihiighhihhggegddebhccefddfccedchdhfgighiihjiijgihihiffffdfdfeefffgffegegdhgfhggfgffffgehdffidfgfggghhhikhijjhhhggfeedgdeeecfeeffehfifhihiihighhgigiihifighfhefedfdfdedfdefdifhghhgghgggffffgfhhgffeecfceeeedefegfdfgghhjgfghfhgheeffeffefhfghggfgghgfhdgghfgeeffgegfgdhfggfhfgegfgghggigffgffgfggffhghgghghiihihifhfgeeedeeeeffggghhhfggggghfggfhfgfgffghehfgfgfhhgggghfhgfhhhhfgeffffffeeefeegffghfighfhffffefeffgeeffegfffffdgiegggggghfhgegffgffeefffefgfgfgigihghhhhfiegegdegdfdegeeffggfgghgihfhghhehghggfgghggghggfgfgfggffgfgfgfgffggffffgffgggfhfgfghfghghgggfhffgfgfghfffefefffgefefffgfgghhgighhgfifffeeegefegffffeggffifggghgfgfgffgggfggfgghgfggggfhgffffefffgghgffgfgfffffggfhffffffgeggggggggggggghgggegeffefefhffegfffeggggfgghggfggfgfgghfigghfghggggegeffeededfegfggggghhgffgghggfffffeeefffffggfgghgghhghhhhghghfggffgffffeefefeffefffgfffhgfgggghghgihgggggffeggffffgfgegfffffgfggegfgffffgfffgfhggfggfgfghghfgghghggggghgggffffffffefefegffgfggfgggggghhghgghfffffgggggffgfggfffgfgfffffffffffffffgffgfgffgfggghggghghgggghggggggfefffgffgffffgffggfgfgg";
const drum2 = "ggggnmghgjsutqjbWWZYdfffffeSaoXaUPVKRXkSapKXcYdgdfirxosgok41v2mo6iy4kuxhvlp1nrqmlmkghfZamdYRPoNbbCWbPJZSGJRRTReXfMbah0eaorPswwgyqf4rxmkqymsnoijngiheedbaaUZeUYWRWRGLIQUKLOPVKWKXUQrPTkocftSkgvvYo5znx/tuwwk33yyvpypohjweiodkffdUMmdLibCVhCTRIcZKZiFTgNcdbUiaqWrlrqyusfkwp6wuhyo3nn6lkptjgetdhmedeTVkISlWNhRSRJZLYLQPQTUXePgZhchhjklivswoq0ou6104yjq2vyrgwlusmmjigkfecSXcGVaaIPGTNPRRTQMSISPPTWYTdbecalekmitllpzhqxwvy2hw0mi4pvsxmpoerkdffebdcVTNbQKLSFNVUIJMRQIUONSWaYTfddciikfgmmosxmyuhyvo7l1zf0zssuvshnxfpmhedhcZWbaMTYMQUSLLXOTaQKQOXSTbTYbdcegigjlkmsrjtoqqv0lqzwxrvqtyzsqswpomlhjgeghXbdZOUYUURRNWVMXMPSQSTXTTWVZYedcgehlfkonlnsprsosvnxuvrm0vvuupsqspptmllifjcefZUaUaUURTUQQQNTPQNSRRQZWRdWVcbdfehfkihlmlnpnmrpqvqqusoyvspowumqopnpoikkjjgdddZdaYZUUQWWUPTRQPUUSPVTSWWXYbbYdceehfjiknknmnqoptptlqsqqtvvntvnrroqnomnkkggjdfeccYaXXWUSWWQRWPRTTTVMTWQWWWXYXbdccfggfhiilllppooomrprqnvorwrpuoqvlppojoljmiiidegeYbaXXXaUUYSSWTSQRWUSSYSYYVUaXZdbdcfeghiiimlkmllqooqpospptslqumssnrqnpqkmkjkifkdghbZaaZYaWXUVVUPVVQPTSTTSVSUYWWaYabddfefhjgikkllnoporrotrrtprxrrvqqtsqrqooppmljlhggdfbbbXZYXWXTTTURTRSRRVUQTSUWTVXVYaYcdcfgfhihklmpooqporpsutstsssqxtpqpqkoqlmpjiikiffheccZZWYaWZUSUSTUTSTTRSTXTVUVVYWYZacdcfefggkklknlmqqpqqprrqsqsnsrrpqnqqnpoljljklhhfgfeedbabZYYWWXXVTWUVWRURUXUUUWXVaYXabbbbgfefhghkkklmlnpmnopqoppoppopnnrplllmllkjkkjmfiigiigfdeebeZaZaabWVZWWYZUXXWYZYYXYYaaZaacacebefeggfhiijikkkjlklmllqlkolmlnnmmlomklkmiklkjkkhjhghhggffdedbccaaaYXXaYWWXXYXWZXYYYXYYZZaZdbaddddefgffiijjjkkjllkonmpolnmmrnnplmpploolmlkjjlkijiffhfegdccbbZbZaZXXYYWVXWVXWZWUXYVWaYaaabbbbbdbdgefghhijkjlmklmmopmnnnooonoollqmjpnmlklkimkjhijgfhgfgffeebddaaaaaZZZXYYXXXYXXZWWZYYZZZYYcbacdbdfeeegghihjjikkkmmlllmnmnnmlnomnnnmmonllmklolmkjkjilihihhhfffebdcbabZXYZYWXXUWXVUWXWXXXYWXWWZabZbaacedeffghiiillilolnopnmpoppqpprrpppnopomlmmlljjiihihffeecedbbcaYZYXXWWWWWXXWUWWUXWXXYXYYZbaZcdcefdeggghijihjkkllmlmnmlkmonmoplmpmmmmmlklmkkmiikkjihihhiffgfeefedecddcbcbZaZZZaaYYZYYZZYZZaaZYZbabbbbcbdeedffdfffhhggihijkikkkllllkklmmmkllkjkkkkklijijihijhhghighhhgffgggggfffeffedddddccdaacabaZaaZYZaaaaYZbabcaZbabccbdbbdeddeeeffgghhiijjjjklllllmmmnnnmonmoonoponnmlnmlllllkjkjihhhgggfdddccbbZZZYYXWWXWWXWVWWVXXWXYXXYYYZZabbccddeeeffggiijkjjllklmmnmoonopoononoooonnnnnllmlkllkijjiiiihffffffeeeccdbbbaaaaZZZYZYYYYYXYXYYYYZYXYZaaaZaaaccbcddeeffefghghiiijjjjkkkllmllmmmmmmmmmnonmmmmmmlllllllkjjjijihhhggggffeeeeeddbbbbaaaaZYYYYYYXXWXXXYXXYYXXXYYYZZaabbbbccceeefggghhijkkkllmmmnnnoooooopppppooopoooonnmmmllkkkjjiiiggfffeedddbbcbaaaaYYYYYXXYXXXXXXXXXYYYYYYZaZZaaaccccdeeefffgggghhiijjjjkkkkklllllllmmlmmmmmmllmmmmmllklkkkkkjjjjiiihhhhgfggfffffeeedcccbbbaaZZaaZYYYYXYYXXYXXYYYYYYZZaaaaabbccdddeffggghiiijkkklllmmmmmnnnnonnoooonnnnnnmmmllllkkjjijiihgggfffeeeddddcbbbaaababbbaaaZZZaaaaaZZaabbbbbbbbbcdddddeeeeffffggggghhhhhhhhhhhhiiiiiiiiiijjjjjijjjjjjjjjjjjjjjjjkjjjjjjjjiiiiiiiiihhhhgggggffffeeeeddddccbbbaabaaaaZZZZZZYZZZZaaaaaaaabbcbccddddeffffgghhiiiiijkkkkklklllllmmmmmlllllllkkkkkkkkkjjiiiihhggggggggffffeeeeeeddddddcccccdcbbcbbbbbbbbbbbbbbbbbbbbbbbccdddddddeeefffffggghhhhhhhhiiiijiijjjjjjkkkkkkkkkkkkkkkkjjjjjiiiiiiiiiihhhhgghgggfffeeeeeeeeeedddddddddcccccccbbbbbbbbbbbbbbbbbcccccdddeeeeeeffffggggghhhhhiihhiiiiiiiiiiiiiiiiiijjiiiiiiiiiiiiiiiihhihhhhhhhhhhhhhgghhhhhhggggggggggfffffffeeeeeeeddddddccccccccbbbbbbbbbbbbbbbbccccddddddeeefffffgghhhhhiiijjjjjjjjkkkklkkkkkkkklkkkkkkkjjjjiiiiiiihhhhggggfffffeeeedddeddddddddddddccddddddddddddddddddddddddddddddddddedeeeeeeefffffffffggggghhhhhiiiiiiiiiijjjjjjjjjjjjjjjjjjjjjjiiiiiiihhhhhhhggggggggfffffeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeedeeedeeddddddddedddddeeeeeeeeeeeeeeeeefffffffffggghhhhhhiiiiiijjjjjjjjjjjjkkkkkjjkkjjjjjjjjiiiiiiihhhhhgggggfffffeeeeeddddddccccccccccbbbbccccccccccccccccccdddddddddeeeeeeefffffgggggghhhhiiiiiiiijjjjjjjjjjjjjjjjjjjjjjjjjjjjiiiiiiiihhhhhgggggggfffffffeeeeeedddddddddddddddddddddddddddddddeeeeeeeeeeeeeeeeeeeeffffffffffffffffffggggggggggggghhhhhhhhhhhhhhhhhiihhiiiiiiiiiiiiiiiiiiiiiihhhhhhhhgggggggggfffffffffeeeeeeeeeeeeeeeeeddeeddddddeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeefffffffffffffgggggggghhhhhhhhhhhhhhiiiiiiiiiiiiiiiiiiiiiiiiihhhhhhhhhhhgggggggggggfgffffffffeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeefffffffffffgggggghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhggggggggggggggggggggggggggggggggggggfgggggggggggfffffffffffffffffeefffeefefeeeeeeeeeeeeffffffffffffffffffggggggggggggggggggggggggggggggfffffffffffffffffffffffffffffffffffggggggggghhhhhhhhhhhhhiiiiiiiiiihhhhhhhhhhhhhggggggggggfffffffeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeffffffffffffffffffggggggggggggghhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhgggggggggggggggggffffffffeeeeeeeeeeeedddddddddddddddddddddeee";
const drum3 = "ggggefffgfeehdffefhfadccddbdcdbdccddffikjlmnmmmqnokoplmqk/mf/oLyidPzUeoahoMhgNhgWWbRVcQSRRRPONJNKDIHFCECIIGNLNKMPLSQRWYbUecehhlmppvzx143797/8/67813512wyyxvnpnjkjgdabZZXXUTQSROQOQLKLJGGIHHEHIHHHOKLQMPSVTVVZacikloqpvuv12z2448+989/9+/9/8//769787846835322x1uzzvtstspmkniiifbYbYXVSQRRNNOLOKKIJKHIJJHIKJHJILJKOLMQNQRQQSUTTVVXYZYabbdbgedjekfgjjmnohsllqpontonsstvpwvqwzxxuwxwxvuvtqrspornjnkgjfdgebZbYVXXVXVWTVUUTTQTSTPTSRSRQRPSPNNNLMLKLLKJHMIKNHHJLIJQMOPPQRPTUVVZZWbZbcedefgfiggikjmknmmpposrrsrvuuxx1zzz21121542644353062421103y00xzvxvvurvussvrsvrqstnsupsrpqqoqnnllnjjgeedcZYXVWVPRRSNPNMMMMNMKJOKLNNKKMLLNJMJLLLMJLKLIKKIJHKHHJKHKHKKKMOMNTQRUVXbbdeeejhikjnonppqqtsvsvwuxxwvzxyzy201001z210110112z110120011y00xxx0xwvvuustsoqqnmmljliifhfefbbcYZaYYYYYVYVWXUWWUUXUTSTTSSSTRQPRSQQSQNOPPPPPPRPQRSQTSSURSXSXVXaZZZbbbbddebfcefdeeecfddgcfeeefceefggegggfgijiikljimijkllkjmklmmlnllmklllkjkllmlmklmlklmjlklnkjnikljllkkjklkkjlkkkljlklmlklmmjlmhkjjijjhifhhhfgffeeccddcccbcbadabbcdacedeeeeefefcdefbecabdbaaYaZYXXaVZXYXXYVZYXaaaYdaadddcdddfdbgfccedbbbcabZaZZaabZaZcZbbcbccdedfhfeihhhiikjjmjlmmmklmlmmlkmijlhhiihgifhgfgejhhjkkkllmnlonnooopnppnolmlmlljijihhjhgehffgdhgffehggfiegfhfhffffghfgeegfeffedddddccccaccaacYZYbYZYYZZXZZaYbbcZcaddddfdedffffdefffddddcecddcccecbedddcefdfeggegfgifhjhijiijjjjkjkijkjikkhjhjjiiigggeggcffedfedefeefedfgggghggiihihjihhihhhgjhfehhggifgfgighgfggfgfefegffdgfeffggffffgggihhhgjijhjiiihigigihffhfcdedddfcbbdcbdcdcdcfceegfggiggihhhghhfhgfgfffefdbdedccbccccdddcdddeedffeefffeffffeghefgffgfgfefefefeefeeeeffehdehdhfffghhhhfhghhhfghfhfgffgeffdfegefefgdgfgfehhggfhghhhgfhffegefgeeefeegfdfgfffffggggifhhghghihghhigihghgefgfefddddcdbddeeecedfhefgfghigiiigjhhghhgfgdfdfdddedddedceeefeffffgigghhfghighghgggggeggfffgfffffffgfggffhgeffefdeffddfeeeeffeeffgfhfhhfghhhhhhfhgfhfefefdfddedddedddeddffefffhhhhhiiihjhiighihfgfgefdedddcdcdbcddddefgfhhghhjhjiihihihhhghfggefefdecdddecddceddeeeffffhhgghihjiihijhkjhjiihiifhhffgfeefffeeeedddeedfeeefffegfgfhfggfgfggfgffgeegeefedeedfedeeededfeffeefffeggfggffggffgfghggfffggfffgfffggfhhggggghgfhghghgfggggffffffgdgfgggfgffghfffgfffgffffgfghhfgfgfgggggfgffgfgfefffeffffffefefffffgffffffffgeggegfgggfghfggggfffffdgdeeeededdfeefeeefgfffghggighhhigghhghfffffgfefeedeedeefeefffgehghhhiighhgiigghgghgegfffeffeffefeefefefgfffgffffgfgfgfgfggffhfhfghhfggfghfgegfgefffffffeefeeeeeefeffeefffgggfggfghhghggggggfgfffefefeeeeeeeedeeeegfffggfggggfghhghgfggffgfffffefgefffffffffffgfggggffggffffefgfffgefgeffggfffggfghgffgffffggffffffffffeffefeeeeefdfefeeeffefffffggggghgghhgggggffffeeeeddedeeeedeffeffffggfhgghghfggggggfggffffgffefeffffefeffegffgffffgfgfffhgfhffgfggfffgffgfgef";

// Instruments table
// Args: sample data (base 64), can loop ?, pitch function (semitones), volume function (0: silent; 1: full); n is time in seconds
let instruments = [
	[bass, false, n=>0, n=>1],
	[noise, false, n=>0, n=>64/43],
	[drum1, false, n=>0, n=>1],
	[drum2, false, n=>0, n=>1],
	[drum3, false, n=>0, n=>1],
	[guitar, false, n=>0, n=>.75],
	[guitar, false, n=>0, n=>.75 - 2 * n],
];

// Patterns table
// Args: for each note: sample index (base 64, blank if none), note, blank if none, "---" stop
let patterns = {
	"bass1":     "AC-4     C-4     C-4     A#3             C-4             A#3     G#3             C-4             G-3             A#3            ",
	"bass2":     "AC-4     C-4     C-4     A#3             C-4             A#3     G#3             C-4             G-3             F-3            ",
	"bass3":     " D-4     D-4     D-4     C-4             D-4             C-4     A#3             D-4             A-3             C-4            ",
	"bass4":     " D-4     D-4     D-4     C-4             D-4             C-4     A#3             D-4             A-3             G-3            ",
	"noise":     "BC-3                                                                                                                            ",
	"drums1":    "                                                                CC-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4 C-4",
	"drums2":    "                                                                                DC-5                     C-5     C-5     G-4 G-4",
	"drums3":    "EC-4            CC-4            EC-4     C-4    CC-4            EC-4            CC-4            EC-4     C-4    CC-4            ",
	"drums4":    "EC-4            CC-4            EC-4     C-4    CC-4            EC-4            CC-4            EC-4    CC-4     C-4     C-4 C-4",
	"drums5":    "DC-5 C-5 C-5     A-4     G-4     F-4 F-4 F-4     D-4 D-4 D-4                                                             C-5    ",
	"drums6":    "DC-5 C-5 C-5     A-4     G-4     G-4 G-4 G-4     F-4 F-4 F-4                     A-4     G-4 G-4     F-4 F-4     E-4    FC-4    ",
	"drums7":    "DB-4 B-4 B-4     G#4     F#4     E-4 E-4 E-4     C#4 C#4 C#4                                                             B-4    ",
	"drums8":    " B-4 B-4 B-4     G#4     F#4     F#4 F#4 F#4     E-4 E-4 E-4                     G#4     F#4 F#4     E-4 E-4     D#4    FC-5    ",
	"kick":      "EC-4             C-4             C-4             C-4             C-4             C-4             C-4             C-4            ",
	"guitar0":   "                                                                                                                        FC-5    ",
	"guitar1":   "        FA#4     C-5     D-5     D#5     F-5     D#5     C-5                     G-4             A#4             C-5            ",
	"guitar2":   "         D#5     D-5     D#5     D-5     C-5     A#4     C-5             A#4     G-5             F-5     D#5     D-5     C-5    ",
	"guitar3":   "         A#4     C-5     D-5     D#5     F-5     D#5     C-5             F-5     D#5     F-5     F#5     F-5     D#5            ",
	"guitar4":   " C-5     D#5     D-5     D#5     D-5     C-5     A#4     C-5             A#4     G-5             F-5     D#5     D-5     C-5    ",
	"guitar5":   "FF-3             F-3 D#3 F-3                                     G-3             G-3 F-3 G-3                                    ",
	"guitar6":   " G#3 G-3 G#3                                                     A#3             A#3 G#3 A#3                                    ",
	"guitar7":   " C-4             C-4    GA-3     C-4    FC-4             G#3                                     A#3                            ",
	"guitar8":   " C-4             C-4    GA-3     C-4    FC-4             G#3                                     G-3                            ",
	"guitar9":   "         C-5     D-5     E-5     F-5     G-5     F-5     D-5             G-5     F-5     G-5     G#5     G-5     F-5            ",
	"guitar10":  " D-5     F-5     E-5     F-5     E-5     D-5     C-5     D-5             C-5     A-5             G-5     F-5     E-5     D-5    ",
	"guitar11":  " D-4             D-4    GB-3     D-4    FD-4             A#3                                     C-4                            ",
	"guitar12":  " D-4             D-4    GB-3     D-4    FD-4             A#3                                     A-3                            ",
	"guitar13":  " D-5     E-5 F-5 E-5     D-5     E-5 F-5 E-5     D-5     E-5 F-5 E-5     D-5     E-5 F-5 E-5     D-5     F-5 E-5 F-5     D-5    ",
	"guitar14":  " D-5     F-5 E-5 F-5     D-5     G-5 F-5 G-5     D-5     A-5 G-5 A-5     D-5     A-5 A#5 A-5     D-5     C-5 D-5 C-5     D-5 D-5",
	"guitar15":  " G-3             G-3 F-3 G-3                                     A-3             A-3 G-3 A-3                                    ",
	"guitar16":  " A#3             A#3 A-3 A#3                                     C-4             C-4 A#3 C-4                                    ",
};

// Sequence table
// Uses indexes from patterns above
let sequence = [
	["bass1", "noise", "noise"],
	["bass2", "drums1", "drums2"],
	["bass1", "drums3"],
	["bass2", "drums4", "guitar0"],
	["bass1", "drums3", "guitar1"],
	["bass2", "drums4", "guitar2"],
	["bass1", "drums3", "guitar1"],
	["bass2", "drums4", "guitar2"],
	["drums3", "kick", "guitar3", "guitar5"],
	["drums4", "kick", "guitar4", "guitar6"],
	["drums3", "kick", "guitar3", "guitar5"],
	["drums4", "kick", "guitar4", "guitar6"],
	["bass1", "drums3", "guitar1", "guitar7"],
	["bass2", "drums4", "guitar2", "guitar8"],
	["bass1", "drums3", "guitar1", "guitar7"],
	["bass2", "drums4", "guitar2", "guitar8"],
	["bass1", "drums3", "drums5", "drums7"],
	["bass2", "drums4", "drums6", "drums8"],
	["bass1", "drums3", "guitar1", "guitar7"],
	["bass2", "drums4", "guitar2", "guitar8"],
	["bass1", "drums3", "guitar1", "guitar7"],
	["bass2", "drums4", "guitar2", "guitar8"],
	["drums3", "kick", "guitar3", "guitar5"],
	["drums4", "kick", "guitar4", "guitar6"],
	["drums3", "kick", "guitar3", "guitar5"],
	["drums4", "kick", "guitar4", "guitar6"],
	["drums3", "bass3", "guitar9", "guitar11"],
	["drums4", "bass4", "guitar10", "guitar12"],
	["drums3", "bass3", "guitar9", "guitar11"],
	["drums4", "bass4", "guitar10", "guitar12"],
	["drums3", "kick", "guitar13", "guitar15"],
	["drums4", "kick", "guitar14", "guitar16"]
];


// Custom parameters
const samplesSampleRate = 8287;
const speed = 12.5;// Steps per second
const notesPerPattern = 32;
const canLoop = true;


// Engine
const base64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const notes = {
"C-":49,
"C#":50,
"D-":51,
"D#":52,
"E-":53,
"F-":54,
"F#":55,
"G-":56,
"G#":57,
"A-":58,
"A#":59,
"B-":60,
}


class Channel{

	SetInstrument (instrument){
		this.sample = instrument[0];
		this.pitchMod = instrument[2];
		this.volMod = instrument[3];
		this.canLoop = instrument[1];
	}

	SetNote (time, note){
		this.note = note;
		this.startTime = time;
		this.sampleIndex = 0;
	}

	Tick (time, sampleRate, samplesSampleRate){
		let freq = 2 ** ((this.note + this.pitchMod(time - this.startTime)) / 12);
		this.sampleIndex += ((freq / 2 ** ((97) / 12)) * (samplesSampleRate / sampleRate));// 97 is the base tone (C-4), but it can be changed to anything else
		

		if (this.canLoop){
			this.sampleIndex %= this.sample.length;
		} else {
			if (this.sampleIndex >= this.sample.length) this.sampleIndex = this.sample.length - 1;
		}
		
		return base64.indexOf(this.sample[int(this.sampleIndex)]) * max(0, min(this.volMod(time - this.startTime), 1))
	}
}

// Initializes the maximum amount of channels needed (if the highest amount of patterns played at the same time in a sequence is four, then four channels are created)
let numberOfChannels = 0;
for (let i = 0; i < sequence.length; i++){
	if (sequence[i].length > numberOfChannels) numberOfChannels = sequence[i].length;
}

let channels = [];
for (let i = 0; i < numberOfChannels; i++){
	channels[i] = new Channel();
	channels[i].SetNote(0, -Infinity);
}

// Player
let prevStep = 0;
let patternIndex = 0;
let noteIndex = -1;
return function(time, sampleRate){

	let output = 0;
	if (noteIndex / notesPerPattern < sequence.length){
		if (int(time * speed) % notesPerPattern != prevStep){
			noteIndex += 1;
			patternIndex = int(noteIndex / notesPerPattern);
			
			for (let channel = 0; channel < sequence[patternIndex].length; channel++){
				let pattern = patterns[sequence[patternIndex][channel]];
				let index = (noteIndex % notesPerPattern) * 4;

				if (pattern[index] != " "){// Instrument update
					channels[channel].SetInstrument(instruments[base64.indexOf(pattern[index])]);// Instrument change
				}
				let note = pattern[index + 1] + pattern[index + 2];
				if (note != "  "){// Note update
					channels[channel].SetNote(time, notes[note] + parseInt(pattern[index + 3]) * 12)// Makes the note value from the string and octave
				} else {
					if (note == "--"){// Note stop
						channels[channel].SetNote(time, -Infinity)
					}
				}
			}
		}
		let sr = sampleRate;
		prevStep = int(time * speed) % notesPerPattern;

		for (let channel = 0; channel < numberOfChannels; channel++){
			if (channels[channel].note > -Infinity) output += channels[channel].Tick(time, sr, samplesSampleRate);
		}
	} else {
		if (canLoop) noteIndex = -1;
	}
	return (output / numberOfChannels) / 32 - 1
}