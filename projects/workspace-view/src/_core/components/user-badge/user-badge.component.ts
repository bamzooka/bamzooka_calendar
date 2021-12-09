import {Component, Input} from "@angular/core";
import {USER_PICTURE_TYPE} from "../../models";
import {mcUserBadgeType} from '@bamzooka/ui-kit-user-badge';
import {getGravatarUrl} from '@bamzooka/utils-general';

@Component({
  selector: "user-badge",
  templateUrl: "./user-badge.component.html",
  styles: [
    `
      :host {
        position: relative;
      }

      .unassigned {
        font-size: 100%;
        width: 35px;
        height: 35px;
        border: 1px solid silver;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `
  ]
})
export class UserBadgeComponent {
  @Input() user: any;
  @Input() pictureType: USER_PICTURE_TYPE = USER_PICTURE_TYPE.INITIALS;
  @Input() badgeType: mcUserBadgeType = 'circle';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() style: any;
  @Input() classes: string[] = [];
  pictureTypes = USER_PICTURE_TYPE;

  getPictureType(): USER_PICTURE_TYPE {
    if (this.pictureType) {
      return this.pictureType;
    } else if (this.user.picture_type) {
      return this.user.picture_type;
    } else {
      return USER_PICTURE_TYPE.INITIALS;
    }
  }

  getGravatarUrl(): string {
    if (this.user) {
      return getGravatarUrl(this.user.email, 100);
    } else {
      return 'assets/images/unassigned.png';
    }
  }
}
