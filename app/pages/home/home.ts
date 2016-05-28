import {Page, NavController, Alert } from 'ionic-angular';
import {Control ,FORM_DIRECTIVES} from '@angular/common';
import {Http} from '@angular/http';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  settings :any ;
  loading:boolean = false;
  postsToDisplay : any = [];
  searchDisplaying : string = "gifs";
  page : number = 1;
  perPage : number = 5;
  after : string;
  stopIndex: number;
  sort :string = "hot";
  moreCount :number = 0;
  searchQueryValue : string;

  searchQueryControl:Control;

  constructor(public http : Http, public nav : NavController) {
    this.searchQueryControl = new Control();

    this.searchQueryControl.valueChanges.debounceTime(1300).distinctUntilChanged().subscribe((userEntry)=>
  {
    if(userEntry!='')
      this.searchQueryValue=userEntry;
      this.fetchData();
  });
  }

  fetchData(){
    let url= 'https://reddit.com/r/'+ this.searchQueryValue +'/' +
    this.sort + '/.json?limit=' + this.perPage;

    if(this.page>1)
    {
      url= url + '&after=' + this.after;
    }
    this.loading = true;

    this.http.get(url).map((response)=> response=response.json()).subscribe((fetchedResult)=>{
      this.stopIndex = this.postsToDisplay.length();
      this.postsToDisplay = this.postsToDisplay.concat(fetchedResult.data.children);
      for(var i= this.postsToDisplay.length -1; i>this.stopIndex ; i--)
      {
        let post=this.postsToDisplay[i];
        if(post.data.url.indexOf('.gifv')>-1 || post.data.url.indexOf('.webm')>-1)
        {
          this.postsToDisplay[i].data.url=post.data.url.replace('.gifv','.mp4');
          this.postsToDisplay[i].data.url=post.data.url.replace('.webm','.mp4');
          if(post.data.snapshot == 'undefined')
          {
            this.postsToDisplay[i].data.snapshot = '';
          }
        }
        else{
          this.postsToDisplay.splice(i,1);
        }
      }
      this.loading = false;

      if (fetchedResult.data.children.length === 0 || this.moreCount >=20)
      {
          let alert= Alert.create({
            title:"Cant fetch anymore",
            subTitle:"Hope you enjoyed, check out more searches or ease your settings.",
            buttons : ['OK']
          });
          this.nav.present(alert);
          this.moreCount=0;
      }
      else{
        this.after=this.postsToDisplay[this.postsToDisplay.length].data.name;
        if(this.postsToDisplay.length < this.perPage* this.page)
        {
          this.moreCount++;
          this.fetchData();
        }
        else{
          this.moreCount=0;
        }
      }

    },
  (err)=>
{
  console.log("SMD");
});
  }
}
