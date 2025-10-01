# Image Hotspots

Allows a Repeater field to be used to define hotspots on an image. Being able to add multiple fields of any type to the Repeater provides flexibility for the information you can store for a hotspot.

![Image Hotspots](https://github.com/user-attachments/assets/636d79e9-1883-4860-96ac-5dee466f270f)

## Setup

1\. Install the module. Two decimal fields will automatically be created on install: `hotspot_x` and `hotspot_y`. You can set custom hotspot and highlight colours in the module config if needed.

2\. Create a "single" image field (i.e. maximum number of files = 1) that you will use store the image that will have hotspots defined on it. Add this field to a template.

3\. Create a Repeater field and add the `hotspot_x` and `hotspot_y` fields to the Repeater. Add any other fields you need to store information about the hotspots you will create. Save the Repeater field.

4\. In the "Details" tab of the Repeater field, expand the "Image Hotspots" section (this section appears for any Repeater field that has the `hotspot_x` and `hotspot_y` fields). For "Image field", select the image field you created in step 2. The "Image height" setting defines the maximum height of the image when displayed in Page Edit.

![Image Hotspots config](https://github.com/user-attachments/assets/5ccba71d-5244-4ec1-a818-2a571fc262ed)

5\. Add the Repeater field to the template you added the image field to in step 2.

## Usage in Page Edit

When an image has been saved to the image field, the Repeater field will display a preview of the image at the top of the field.

Click "Add New" to create a new hotspot. The hotspot appears at the top left of the image initially and can be moved by clicking and dragging it to the desired location on the image. The X/Y coordinates of the hotspot will be automatically updated as the hotspot is moved. For precise adjustments you can modify the X/Y coordinates directly and the hotspot position will be updated.

To identify which Repeater item corresponds to a given hotspot, click on the hotspot. The corresponding Repeater item header will receive an orange outline. Click the hotspot again to remove the orange outline.

To identify which hotspot corresponds to a given Repeater item, expand the Repeater item and focus either the X or Y coordinate fields. The corresponding hotspot will be highlighted in orange.

![Image Hotspots usage](https://github.com/user-attachments/assets/054cec0d-21e9-4f5e-8323-73517329d8c3)

## On the frontend

It's up to you to display the hotspots on the frontend in any way you need. The values of the `hotspot_x` and `hotspot_y` fields are percentages so when given absolution positioning over the image your hotspot markers can preserve their positions as the image scales up or down in a responsive layout.
