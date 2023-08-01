//------------ IBNIZ-BASED INTERPRETER ------------


this.IBNIZ ??= function(z,...vars){ // Limited IBNIZ style player

    sk = vars // stack
    rsk= [] // rstack
    skl= sk.length
    
        for(var ixa=0; ixa<z.length; ixa++) {

				switch(z[ixa]) {
				case 'd': sk.push(sk[skl-1]); break;
				case 'p': sk.pop(); break;
				case 'x':
                var temp= sk[skl-1]
                sk[skl-1] = sk[skl-2]
                sk[skl-2] = temp
				break
				case 'v':
                var temp = sk[skl-3]
                sk[skl-3] = sk[skl-2]
                sk[skl-2] = sk[skl-1]
                sk[skl-1] = temp
				break
case 'P': rsk.push(sk.pop()); break;
case 'R': sk.push(rsk.pop()); break;
case 'w': sk.push(...vars); break;
case '+':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa+tempb)
break
case '-':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa-tempb)
break
case '*':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa*tempb)
break
case '/':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa/tempb)
break
case '%':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa%tempb)
break
case '&':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa&tempb)
break
case '|':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa|tempb)
break
case '^':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa^tempb)
break
case 'r':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa>>tempb)
break
case 'l':
                tempb=sk.pop()
                tempa=sk.pop()
                sk.push(tempa<<tempb)
break
case '~': sk.push(~sk.pop()); break;
case '<': sk.push(temp=sk.pop(),temp<0?0:temp); break;
case '>': sk.push(temp=sk.pop(),temp<0?0:temp); break;
case '=': sk.push(temp=sk.pop(),temp==0); break;
case 'q': sk.push(sqrt(sk.pop())); break;
case 's': sk.push(sin(sk.pop())); break;
case 'a': sk.push(atan2(sk.pop(),sk.pop())); break;
case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
	sk.push(Number(z[ixa])); break;
case 'A': sk.push(10); break;
case 'B': sk.push(11) ; break;
case 'C': sk.push(12) ; break;
case 'D': sk.push(13) ; break;
case 'E': sk.push(14) ; break;
case 'F': sk.push(15) ; break;
case 'T': sk.push(z[ixa+1]*10000 + z[ixa+2]*1000 + z[ixa+3]*100 + z[ixa+4]*10 + z[ixa+5]*1); ixa+=5; break;
case 'M': sk.push(sk.pop()*100000); break;
				}
    
        }
    
        return sk.pop()
    },
    
    //------------ SONG SETUP ------------
    
    // + - * / % & | ^ l d p x v P R < = > are as in IBNIZ
    
    // r is shift right instead of rotate right
    
    // single hex digits are each an item on the stack, even without seperation.
    // A 5 digit decimal number can be input using TXXXXX, where XXXXX is the decimal number. It must be 5 digits and must be 
    // decimal, so you can't use something like `T362`, you must use `T00362`. other examples: `T00005`, `T04096`.
    
    // M multiplies the top number on the stack by 100,000. (Works really well with T to create simulated 10, 15, 20, etc.
    // digit numbers.)
    
    // Other symbols do nothing.
    
    //------------ SONG ------------
    
    IBNIZ("dw8r+^",t)
