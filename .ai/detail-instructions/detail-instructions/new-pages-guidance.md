# Use this instructions if you have to create a new page 

- if not defined ask the developer at wich path the new patch should be placed
- for new pathes create a wrapper page in pages folder. Structure the page in meaningful sub components. Place them in components folder and import them in the wrapper page.
- a view has to begin with some sort of header. Always use a q-card for the header. Header should contain a fitting icon and a title. It should look like this:
```vue
    <q-card class="bg-grey-1 q-mb-md">
      <q-card-section class="q-mb-md">
        <div class="row items-center q-gutter-sm">
          <div class="q-mr-md">
            <q-avatar square size="xl" class="bg-grey-2" style="border-radius: 10px;">
              <q-icon name="$FITTING_ICON" />
            </q-avatar>
          </div>
          <div class="text-h6">
            $PAGE_TITLE
          </div>
          <q-space />
          $ADDITIONAL_CONTENT
        </div>
      </q-card-section>
    </q-card>
```
- the rest of the requested content should be placed in another q-card 