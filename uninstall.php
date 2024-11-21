<?php
// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete all plugin options
$options = [
    'my_vcard_plugin_company',
    'my_vcard_plugin_last_name',
    // ... list all your options
];

foreach ($options as $option) {
    delete_option($option);
}
