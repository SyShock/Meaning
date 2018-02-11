import { NgModule } from "@angular/core";
import { TemplatesComponent } from "./templates/templates";
import { WideViewComponent } from "./wide-view/wide-view";
import { NarrowViewComponent } from "./narrow-view/narrow-view";
import { AboutComponent } from "./about/about";
@NgModule({
  declarations: [
    TemplatesComponent,
    WideViewComponent,
    NarrowViewComponent,
    AboutComponent,
  ],
  imports: [],
  exports: [
    TemplatesComponent,
    WideViewComponent,
    NarrowViewComponent,
    AboutComponent,
  ],
  entryComponents: []
})
export class ComponentsModule {}
