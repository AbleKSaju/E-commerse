// var buyChoco = function(prices, money) {
//     var x=[]
//     for(i=0;i<prices.length-1;i++){
//         for(j=0;j<prices.length;j++){
//             if(prices[j]>prices[j+1]){
//                 temp=prices[j]
//                 prices[j]=prices[j+1]
//                 prices[j+1]=temp
//             }
//         }
//         x=prices
//     }
//     console.log(x);
//     var first=x[0]
//     var second=x[1]
//     var total=first+second
//     console.log(total);
//     if(total>money){
//         console.log("less");
//         return money
//     }else if(total==money){
//         console.log("else");
//         return 0
//     }else{
//         console.log(total);
//         console.log(money);
//         var y=money-total
//         console.log("mon");
//         console.log(y);
//         return y
//     }
// };
// console.log(buyChoco([4,6,2,1,5,7],6));





// var backspaceCompare = function(s, t) {
//     var x=s.split('')
//     var y=t.split('')
//     for(var i=0;i<x.length;i++){
//         if(x[i]=='#'){
//             x[i-1]=x[i]
//             x[i-1]=x[i+1]
//             x.length--
//             x.length--
//         }
//     }
//      for(var i=0;i<y.length;i++){
//         if(y[i]=='#'){
//             y[i-1]=y[i]
//             y[i-1]=y[i+1]
//             y.length--
//             y.length--
//         }
//     }
//     var a=x.join()
//     var b=y.join()
//     if(a==b){
//         return true
//     }else{
//         return false
//     }
// };
// var a="ab#c"
// var b="ad#c"
// console.log(backspaceCompare(a,b))



// var isMonotonic = function(nums) {
//     var x=[]
//     var y=[]
//     for(i=0;i<nums.length;i++){
//         console.log(nums[i]);
//     if(nums[i]<nums[i+1]){
//         x.push(nums[i])

//     }else if(nums[i]>nums[i+1]){
//         y.push(nums[i])
//     }
//     }
//     if(x==nums || y==nums){
//         return true
//     } else{
//         return false
//     }
// }

// console.log(isMonotonic([6,5,4,3]));

var isMonotonic = function(num) {
var nums=[]
nums=num
    for(i=0;i<nums.length-1;i++){
        for(j=0;j<nums.length;j++)
        if(nums[i]==nums[j] && i!=j){
            console.log(k);
            for(k=j;k<nums.length;k++){
                nums[j]=nums[j+1]
            }
            console.log(nums[j]);
        }
    }
    console.log(nums.length);
    console.log(nums);
    var x=[]
    var y=[]
    for(i=0;i<nums.length;i++){
    if(nums[i]<=nums[i+1]){
        x.push(nums[i])

    }else if(nums[i]>=nums[i+1]){
        y.push(nums[i])
    }
    }
    x.push(nums[nums.length-1])
    y.push(nums[nums.length-1])
    if(x==nums|| y==nums){
        return true
    } else{
        return false
    }
}
console.log(isMonotonic([3,4,5,5,6,7]));